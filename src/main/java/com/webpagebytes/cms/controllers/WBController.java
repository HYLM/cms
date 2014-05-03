package com.webpagebytes.cms.controllers;

import java.util.ArrayList;

import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import org.json.JSONException;

public class WBController {
	public static final String SORT_PARAMETER_DIRECTION = "sort_dir";
	public static final String SORT_PARAMETER_PROPERTY = "sort_field";
	public static final String SORT_PARAMETER_DIRECTION_ASC = "asc";
	public static final String SORT_PARAMETER_DIRECTION_DSC = "dsc";
	public static final String PAGINATION_START = "index_start";
	public static final String PAGINATION_COUNT = "count";
	public static final String PAGINATION_TOTAL_COUNT = "total_count";
	public static final String DATA = "data";
	public static final String ADDTIONAL_DATA = "additional_data";
	public<T> List<T> filterPagination(HttpServletRequest request, List<T> records, Map<String, Object> additionalInfo)
	{
		String paginationStart = request.getParameter(PAGINATION_START);
		String paginationCount = request.getParameter(PAGINATION_COUNT);
		ArrayList<T> result = new ArrayList<T>();
		
		if (paginationCount == null || paginationStart == null)
		{
			additionalInfo.put(PAGINATION_START, 0);
			additionalInfo.put(PAGINATION_COUNT, records.size());
			additionalInfo.put(PAGINATION_TOTAL_COUNT, records.size());
			result.addAll(records);
			return result;
		} 

		int start = 0;
		int count = 0;
		
		try {
			start = Integer.valueOf(paginationStart);
			count = Integer.valueOf(paginationCount);
		} catch (NumberFormatException e)
		{
			additionalInfo.put(PAGINATION_START, 0);
			additionalInfo.put(PAGINATION_COUNT, records.size());
			additionalInfo.put(PAGINATION_TOTAL_COUNT, records.size());
			result.addAll(records);
			return result;
		}
		
		if (count < 0 || start < 0)
		{
			result.addAll(records);
			return result;			
		}
		
		int end = start + count;
		
		for(int i = start; i < end && i < records.size(); i++)
		{
			result.add(records.get(i));
		}
		
		additionalInfo.put(PAGINATION_START, start);
		additionalInfo.put(PAGINATION_COUNT, result.size());
		additionalInfo.put(PAGINATION_TOTAL_COUNT, records.size());

		return result;
	}

	public org.json.JSONArray filterPagination(HttpServletRequest request, org.json.JSONArray records, Map<String, Object> additionalInfo)
	{
		String paginationStart = request.getParameter(PAGINATION_START);
		String paginationCount = request.getParameter(PAGINATION_COUNT);
		
		if (paginationCount == null || paginationStart == null)
		{
			additionalInfo.put(PAGINATION_START, 0);
			additionalInfo.put(PAGINATION_COUNT, records.length());
			additionalInfo.put(PAGINATION_TOTAL_COUNT, records.length());
			return records;
		} 

		int start = 0;
		int count = 0;
		
		try {
			start = Integer.valueOf(paginationStart);
			count = Integer.valueOf(paginationCount);
		} catch (NumberFormatException e)
		{
			additionalInfo.put(PAGINATION_START, 0);
			additionalInfo.put(PAGINATION_COUNT, records.length());
			additionalInfo.put(PAGINATION_TOTAL_COUNT, records.length());
			return records;
		}
		
		if (count < 0 || start < 0)
		{
			return records;			
		}
		
		int end = start + count;
		org.json.JSONArray result = new org.json.JSONArray();
		
		for(int i = start; i < end && i < records.length(); i++)
		{
			try 
			{
				result.put(records.get(i));
			} catch (JSONException e)
			{
				return null;
			}
		}
		
		additionalInfo.put(PAGINATION_START, start);
		additionalInfo.put(PAGINATION_COUNT, result.length());
		additionalInfo.put(PAGINATION_TOTAL_COUNT, records.length());

		return result;
	}

	
	private String adminUriPart;

	public String getAdminUriPart() {
		return adminUriPart;
	}

	public void setAdminUriPart(String adminUriPart) {
		this.adminUriPart = adminUriPart;
	}
	
	
}