/*
 *   Copyright 2014 Webpagebytes
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/

package com.webpagebytes.cms.engine;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.lang.reflect.Method;
import java.util.Map;
import java.util.HashMap;

import com.webpagebytes.cms.controllers.Controller;
import com.webpagebytes.cms.exception.WPBException;
import com.webpagebytes.cms.utility.Pair;

public class AjaxRequestProcessor {
	public static final String PRAGMA_HEADER = "Pragma";
	public static final String NO_CACHE_HEADER = "no-cache";
	public static final String CACHE_CONTROL_HEADER = "Cache-Control";
	
	
	private final String keyUrlPart = "/{key}";
	private AdminServletOperationsReader operationsReader;
	private String adminUriPart;
	
	private Map<String, Controller> controllersMap;
	
	public AjaxRequestProcessor()
	{
		operationsReader = new AdminServletOperationsReader();
		controllersMap = new HashMap<String, Controller>();
	}
	public void initialize(String configResourceFolder, String resourcesWhiteList) throws WPBException
	{
		String resPath = "META-INF/".concat(configResourceFolder).concat("/").concat(resourcesWhiteList);
		operationsReader = getOperationsReader();
		operationsReader.initialize(resPath);
	}
	
	//returns a pair of url and a possible url parameter (i.e. key)
	public Pair<String, String> matchUrlForController(String reqUri, String httpOperation)
	{
		httpOperation = httpOperation.toUpperCase();
		// if the reqUri matches one of the existing operations then we are lucky
		if (operationsReader.operationToMethod(reqUri, httpOperation) != null)
		{
			return new Pair(reqUri, null);
		}
		// we match to an url like /url/{key} or /url*
		int countSlash = 0;
		for(int i = 0; i< reqUri.length(); i++)
		{
			if (reqUri.charAt(i) == '/')
			{
				countSlash+=1;
			}
		}
		if (countSlash >= 2) 
		{
			int pos1 = reqUri.lastIndexOf('/');
			String urlToMatch = reqUri.substring(0, pos1) + this.keyUrlPart;
			if (operationsReader.operationToMethod(urlToMatch, httpOperation) != null)
			{
				String param = reqUri.substring(pos1+1);
				return new Pair(urlToMatch, param);
			}
		}
		if (countSlash==1)
		{
			String wildUrl = operationsReader.wildOperationToMethod(reqUri, httpOperation);
			if (wildUrl!= null && wildUrl.length()>0)
			{
				return new Pair(wildUrl, ""); 
			}
		}
		return null;		
	}
	
	public boolean isAjaxRequest(HttpServletRequest req, String reqUri)
	{
		Pair<String, String> result = matchUrlForController(reqUri, req.getMethod());
		if (result != null)
		{
			return true;
		}
		return false;
	}
	
	protected synchronized Controller getController(String controllerClassName) throws WPBException
	{
		if (controllersMap.containsKey(controllerClassName))
		{
			 return controllersMap.get(controllerClassName);
		}
		
		// not found so we create it
		try
		{
			Controller controller = (Controller) Class.forName(controllerClassName).newInstance();
			controller.setAdminUriPart(getAdminUriPart());
			
			controllersMap.put(controllerClassName, controller);
			return controller;

		} catch (Exception e)
		{
			throw new WPBException(e.getMessage(), e);
		}
	}
	
	public void process(HttpServletRequest req, 
			   HttpServletResponse resp, 
			   String reqUri) throws WPBException
	{
		// no matter the response add the pragma no cache
		resp.addHeader(CACHE_CONTROL_HEADER, NO_CACHE_HEADER);
		resp.addHeader(PRAGMA_HEADER, NO_CACHE_HEADER);
		Pair<String, String> genericUri = matchUrlForController(reqUri, req.getMethod());
		if (genericUri == null)
		{
			resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
			return;			
		}
		Pair<String,String> pair = operationsReader.operationToMethod(genericUri.getFirst(), req.getMethod());
		if (pair == null) 
		{
			resp.setStatus( HttpServletResponse.SC_NOT_FOUND);
			return;
		}
		
		Object controller = getController(pair.getFirst());
		try
		{
			Method[] methods = Class.forName(pair.getFirst()).getMethods();
			boolean bFound = false;
			for(Method method: methods)
			{
				if (method.getName().compareTo(pair.getSecond()) == 0)
				{
					bFound = true;
					if (genericUri.getSecond() != null)
					{
						req.setAttribute("key", genericUri.getSecond());
					}
					method.invoke(controller, req, resp, reqUri);
					return;
				}
			}
			if (!bFound)
			{
				throw new Exception("no Controller method " + pair.getSecond());
			}
		} 
		catch (Exception e)
		{
			throw new WPBException (e.getMessage(), e);
		}
	}

	public AdminServletOperationsReader getOperationsReader() {
		return operationsReader;
	}

	public void setOperationsReader(AdminServletOperationsReader operationsReader) {
		this.operationsReader = operationsReader;
	}

	public Map<String, Controller> getControllersMap() {
		return controllersMap;
	}

	public void setControllersMap(Map<String, Controller> controllersMap) {
		this.controllersMap = controllersMap;
	}
	public String getAdminUriPart() {
		return adminUriPart;
	}
	public void setAdminUriPart(String adminUriPart) {
		this.adminUriPart = adminUriPart;
	}

	

}
