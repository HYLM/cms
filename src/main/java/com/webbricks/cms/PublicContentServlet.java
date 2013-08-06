package com.webbricks.cms;

import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;


import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.apphosting.utils.remoteapi.RemoteApiPb.Request;
import com.webbricks.cache.DefaultWBCacheFactory;
import com.webbricks.cache.WBCacheFactory;
import com.webbricks.cache.WBCacheInstances;
import com.webbricks.cache.WBParametersCache;
import com.webbricks.cache.WBProjectCache;
import com.webbricks.cache.WBUrisCache;
import com.webbricks.cache.WBWebPagesCache;
import com.webbricks.cmsdata.WBFile;
import com.webbricks.cmsdata.WBParameter;
import com.webbricks.cmsdata.WBProject;
import com.webbricks.cmsdata.WBUri;
import com.webbricks.cmsdata.WBWebPage;
import com.webbricks.exception.WBException;
import com.webbricks.exception.WBIOException;
import com.webbricks.exception.WBLocaleException;
import com.webbricks.exception.WBSetKeyException;
import com.webbricks.template.WBFreeMarkerModuleDirective;

public class PublicContentServlet extends HttpServlet {
	private static final Logger log = Logger.getLogger(PublicContentServlet.class.getName());
	public static final String CACHE_QUERY_PARAM = "cqp";
	private WBServletUtility servletUtility = null;
	
	// this is the common uri part that will be common to all requests served by this CMS
	// corresponds to uri-prefix init parameter.
	
	private String uriCommonPrefix = ""; 
	
	private URLMatcher urlMatcher;
	private PageContentBuilder pageContentBuilder;
	private FileContentBuilder fileContentBuilder;
	private WBCacheInstances cacheInstances;
	
	public PublicContentServlet()
	{
		setServletUtility(new WBServletUtility());
	}
	
	public void init(ServletConfig config) throws ServletException
    {
		super.init(config);
		String initUriPrefix = servletUtility.getInitParameter("uri-prefix", this);
		if (initUriPrefix.length() > 0)
		{
			if (initUriPrefix.endsWith("/"))
			{
				initUriPrefix = initUriPrefix.substring(0, initUriPrefix.length()-1);
			}
			uriCommonPrefix = initUriPrefix;
		}
		
		try
		{
			WBCacheFactory wbCacheFactory = new DefaultWBCacheFactory();
			this.cacheInstances = new WBCacheInstances(wbCacheFactory.createWBUrisCacheInstance(), 
					wbCacheFactory.createWBWebPagesCacheInstance(), 
					wbCacheFactory.createWBWebPageModulesCacheInstance(), 
					wbCacheFactory.createWBParametersCacheInstance(),
					wbCacheFactory.createWBImagesCacheInstance(),
					wbCacheFactory.createWBArticlesCacheInstance(),
					wbCacheFactory.createWBMessagesCacheInstance(),
					wbCacheFactory.createWBProjectCacheInstance());

			Set<String> allUris = cacheInstances.getWBUriCache().getAllUris();
			this.urlMatcher = new URLMatcher();
			this.urlMatcher.initialize(allUris, cacheInstances.getWBUriCache().getCacheFingerPrint());
						
			pageContentBuilder = new PageContentBuilder(cacheInstances);
			pageContentBuilder.initialize();
			
			fileContentBuilder = new FileContentBuilder(cacheInstances);
			fileContentBuilder.initialize();
			
		} catch (Exception e)
		{
			log.log(Level.SEVERE, "ERROR: ", e);
			throw new ServletException(e);
		}
    }
	
	private void handleRequest(HttpServletRequest req, HttpServletResponse resp)
    	throws ServletException,
    	java.io.IOException
    {
		String uri = req.getRequestURI();
		if (uriCommonPrefix.length()>0 && uri.startsWith(uriCommonPrefix))
		{
			uri = uri.substring(uriCommonPrefix.length());
		} else
		{
			resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
			return;
		}
		//reinitialize the matchurlToPattern if needed
		if (cacheInstances.getWBUriCache().getCacheFingerPrint().compareTo(urlMatcher.getFingerPrint())!= 0)
		{
			try
			{
				Set<String> allUris = cacheInstances.getWBUriCache().getAllUris();
				urlMatcher.initialize(allUris, cacheInstances.getWBUriCache().getCacheFingerPrint());
			} catch (WBIOException e)
			{
				log.log(Level.SEVERE, "Could not reinitialize the URL matcher ", e);
				// do not fail as some urls may still work
			}
		}
		URLMatcherResult urlMatcherResult = urlMatcher.matchUrlToPattern(uri);
		if (urlMatcherResult == null)
		{
			resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
			return;
		} else
		{
			try
			{
				WBUri wbUri = cacheInstances.getWBUriCache().get(urlMatcherResult.getUrlPattern());
				if ((null == wbUri) || (wbUri.getEnabled() == null) || (wbUri.getEnabled() == 0))
				{
					resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
					return;					
				}
				if (wbUri.getResourceType() == WBUri.RESOURCE_TYPE_TEXT)
				{
					WBWebPage webPage = pageContentBuilder.findWebPage(wbUri.getResourceExternalKey());
					if (webPage == null)
					{
						resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
						return;
					}
					WBProject wbProject = cacheInstances.getProjectCache().getProject();
					String content = pageContentBuilder.buildPageContent(req, urlMatcherResult, webPage, wbProject);
					resp.setCharacterEncoding("UTF-8");
					if (webPage.getIsTemplateSource() == null || webPage.getIsTemplateSource() == 0)
					{
						String cqp = req.getParameter(CACHE_QUERY_PARAM);
						if (cqp != null && cqp.equals(webPage.getHash().toString()))
						{
							// there is a request that can be cached
							resp.addHeader("cache-control", "max-age=86400");
						}
					} else
					{
						resp.addHeader("cache-control", "no-cache;no-store;");
					}
					resp.setContentType(webPage.getContentType());			
					ServletOutputStream os = resp.getOutputStream();
					os.write(content.getBytes("UTF-8"));
					os.flush();
				} else
				if (wbUri.getResourceType() == WBUri.RESOURCE_TYPE_FILE)
				{
					WBFile wbFile = fileContentBuilder.find(wbUri.getResourceExternalKey());
					if (wbFile == null)
					{
						resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
						return;						
					}
					String cqp = req.getParameter(CACHE_QUERY_PARAM);
					if (cqp != null && cqp.equals(wbFile.getHash().toString()))
					{
						// there is a request that can be cached
						resp.addHeader("cache-control", "max-age=86400");
					}
					ServletOutputStream os = resp.getOutputStream();
					resp.setContentType(wbFile.getAdjustedContentType());													
					fileContentBuilder.writeFileContent(wbFile, os);
					os.flush();
					
				} else
				{
					resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
					return;										
				}
			} 
			catch (WBLocaleException e)
			{
				log.log(Level.SEVERE, "ERROR: ", e);
				resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
				return;				
			}
			catch (Exception e)
			{
				log.log(Level.SEVERE, "ERROR: ", e);
				resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
				return;
			}
		}
    }
	
	public void doGet(HttpServletRequest req, HttpServletResponse resp)
     throws ServletException,
            java.io.IOException
            {
			handleRequest(req, resp);
			}

	public void doPost(HttpServletRequest req, HttpServletResponse resp)
    throws ServletException,
           java.io.IOException
           {
			handleRequest(req, resp);
           }

	public void doPut(HttpServletRequest req, HttpServletResponse resp)
    throws ServletException,
           java.io.IOException
           {
			handleRequest(req, resp);
           }

	public void doDelete(HttpServletRequest req, HttpServletResponse resp)
    throws ServletException,
           java.io.IOException
           {
			handleRequest(req, resp);
           }

	public WBServletUtility getServletUtility() {
		return servletUtility;
	}

	public void setServletUtility(WBServletUtility servletUtility) {
		this.servletUtility = servletUtility;
	}
	
	

}
