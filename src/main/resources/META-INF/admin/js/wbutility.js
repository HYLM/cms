String.prototype.format = function() {
    var formatted = this;
    for (var i = 0; i < arguments.length; i++) {
        var regexp = new RegExp('\\{'+i+'\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
	
};

function getURLParameter(name) {
	var value = (location.search.match(RegExp("[?|&]"+name+'=(.+?)(&|$)'))||[,undefined])[1];
	if (value != undefined) {
		return decodeURIComponent(value);
    } 
	return undefined;
};

function getAdminPath() {
	var pos = location.pathname.lastIndexOf('/');
	var adminPath = pos > 0 ? location.pathname.substring(0, pos) : "";
	return location.protocol + '//' + location.host + adminPath;
}

function transferProperties(objKeys, objValues)
{
	var result = {};
	for(var prop in objKeys) {
		if (objKeys[prop] in objValues) {
			result[prop] = objValues[objKeys[prop]];
		}
	}
	return result;
}
function escapehtml(html) {
        if (html===0) html = "0";
        html = html || "";
        var escaped = "" + html;
        var findReplace = [[/&/g, "&amp;"], [/</g, "&lt;"], [/>/g, "&gt;"], [/"/g, "&quot;"], [/'/g, "&apos;"]]
        for(var item in findReplace) {
             escaped = escaped.replace(findReplace[item][0], findReplace[item][1]);
        }
        return escaped;
}

Date.prototype.toFormatString = function (time, format) {
	if (typeof time == 'string') {
		this.setTime((new Number(time)).valueOf());
	} else {
		this.setTime(time);
	};
	var now = new Date();
	if (format == undefined) 
		format = "dd/mm/yyyy hh:mm:ss";
	else
		format =  format.toLowerCase();
	var d = this.getDate(), mo = this.getMonth()+1, yF = this.getFullYear(), h = this.getHours(), mi = this.getMinutes(), s = this.getSeconds();
	d = ("0" + d); d=d.substr(d.length-2);
	mo = ("0" + mo); mo=mo.substr(mo.length-2);
	h = ("0" + h); h=h.substr(h.length-2);
	mi = ("0" + mi); mi=mi.substr(mi.length-2);
	s = ("0" + s); s=s.substr(s.length-2);
	
	if (format == "today|dd/mm/yyyy hh:mm") {
		if (now.getFullYear()==yF && ((now.getMonth()+1)==mo) && now.getDate()==d) {
			// it's the same date as today
			return 'Today {0}:{1}'.format (h,mi);
		} else
			return "{0}/{1}/{2} {3}:{4}".format(d,mo,yF,h,mi);
	} else
	if (format == "dd/mm/yyyy hh:mm:ss") {
		return "{0}/{1}/{2} {3}:{4}".format(d,mo,yF,h,mi);
	} else
	if (format == "mm/dd/yyyy hh:mm:ss") {
		return "{0}/{1}/{2} {3}:{4}".format(mo,d,yF,h,mi);
	} else
		if (format == "ddmmyyyy_hhmm") {
		return "{0}{1}{2}_{3}{4}".format(d,mo,yF,h,mi);
	}
	return "";
}

String.prototype.escapehtml = function (){
	var html = this;
	return escapehtml(html);
}

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
        "use strict";
        if (this == null) {
            throw new TypeError();
        }
        var t = Object(this);
        var len = t.length >>> 0;
        if (len === 0) {
            return -1;
        }
        var n = 0;
        if (arguments.length > 1) {
            n = Number(arguments[1]);
            if (n != n) { // shortcut for verifying if it's NaN
                n = 0;
            } else if (n != 0 && n != Infinity && n != -Infinity) {
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
        }
        if (n >= len) {
            return -1;
        }
        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
        for (; k < len; k++) {
            if (k in t && t[k] === searchElement) {
                return k;
            }
        }
        return -1;
    }
}


(function ($) {

	WBObjectManager = function ( thisElement, options ) {
		this.init( thisElement, options );
	}
	WBObjectManager.prototype = 
	{
		defaults: { 
			fieldsPrefix: 'wb', 
			errorLabelsPrefix: 'err',
			generalError: '',
			fieldsDefaults: {},
			validationRules: {},
			errorLabelClassName: '',
			errorInputClassName: ''
		},
		
		init: function ( thisElement, options ) {			
			this.thisElement = $(thisElement);
			this.options = $.extend ( {} , this.defaults, options );
			if ( 'fieldsDefaults' in options) {
				this.resetFields();
			}
		},
		getOptions: function () {
			if (! this.options) 
				return this.defaults
			else
				return this.options;
		},
		
		getObjectFromFields: function ( ) {
			var object = {};
			var elements = this.thisElement.find('input[id^="' + this.getOptions().fieldsPrefix + '"]' + ',textarea[id^="' + this.getOptions().fieldsPrefix + '"]' + ',select[id^="' + this.getOptions().fieldsPrefix + '"]');
			var tempThis = this;
			$.each( elements, function (index, value) {
				var key = $(value).attr('id').substring( tempThis.getOptions().fieldsPrefix.length );
				switch (value.type) {
					case 'text':
					case 'file':
					case 'hidden':
					case 'password':
					case 'textarea':
					case 'select-multiple':
					case 'select-one':
						object[key] = $(value).val();
						break;
					case 'checkbox':
					
					case 'radio':
						var name = $(value).attr('name');
						var checked = tempThis.thisElement.find('input[name^=' + name + ']:checked');
						if (checked.length == 1) {
							object[name] = $(checked[0]).attr('value');
						}							
						break;
				}
			} );
			return object;				
		},
		populateFieldsFromObject: function (object) {
			var elements = this.thisElement.find('input[id^="' + this.getOptions().fieldsPrefix + '"]' + ',textarea[id^="' + this.getOptions().fieldsPrefix + '"]' + ',select[id^="' + this.getOptions().fieldsPrefix + '"]');
			var tempThis = this;
			$.each( elements, function (index, value) {
				var key = $(value).attr('id').substring( tempThis.getOptions().fieldsPrefix.length );
				switch (value.type) {
					case 'text':
					case 'file':
					case 'hidden':
					case 'password':
					case 'textarea':
					case 'select-multiple':
					case 'select-one':
						if (key in object) {
							$(value).val(object[key]);
						}
						break;
					case 'checkbox':
					
					case 'radio':
						if (key in object) {
							var fieldValue = object[key];
							var name = $(value).attr('name');
							var items = tempThis.thisElement.find('input[name^=' + name + '][value="' + fieldValue + '"]');
							$.each( items, function (index,item) {
								$(item).attr('checked', true);
							});
						}
						break;
				}
				
			});
		
		},
		setEditableFields: function (enable) {
			var elements = this.thisElement.find('input, button, select');
			var tempThis = this;
			$.each( elements, function (index, item) {
				if (enable == false)
					$(item).attr("disabled", "disabled");
				else
					$(item).removeAttr("disabled");
			});
		},
		resetFields: function () {
			var elements = this.thisElement.find('input[id^="' + this.getOptions().fieldsPrefix + '"]' + ',textarea[id^="' + this.getOptions().fieldsPrefix + '"]' + ',select[id^="' + this.getOptions().fieldsPrefix + '"]');
			var tempThis = this;
			$.each( elements, function (index, value) {
				var key = $(value).attr('id').substring( tempThis.getOptions().fieldsPrefix.length );
				switch (value.type) {
					case 'text':
					case 'file':
					case 'hidden':
					case 'password':
					case 'textarea':
					case 'select-multiple':
					case 'select-one':
						var valueToSet = "";
						if (key in tempThis.getOptions().fieldsDefaults)
							valueToSet = tempThis.getOptions().fieldsDefaults[key];
						$(value).val (valueToSet);
						break;
					case 'checkbox':
						var valueToSet = 0;
						if (key in tempThis.getOptions().fieldsDefaults)
							valueToSet = tempThis.getOptions().fieldsDefaults[key];
						$(value).attr('checked', valueToSet==1 ? true: false);
						break;
					case 'radio':
						var name = $(value).attr('name');
						tempThis.thisElement.find('input[name^=' + name + ']').attr('checked', false);
						if (key in tempThis.getOptions().fieldsDefaults)
							var valueToSet = tempThis.getOptions().fieldsDefaults[key];
							var radioElements = tempThis.thisElement.find('input[name^=' + name + '][value="' + valueToSet + '"]');
							$.each(radioElements, function (index, radioItem) {
								$(radioItem).attr('checked', true);
							});
						break;
				}				
			} );
			
			tempThis.resetErrors();
		},
		convertErrors: function (errorIds, errorTexts) {
			var result = {};
			$.each (errorIds, function (key, error) {
				if (error in errorTexts) {
					result[key] = errorTexts[error];
				} else {
					result[key] = errorIds[key];
				}
			});
			return result;
		},	
		setErrors: function ( errors ) {
			errors = errors || {} ;
			var labelElements = this.thisElement.find('[id^="' + this.getOptions().errorLabelsPrefix + '"]');
			var tempThis = this;
			var errorLabelClass = tempThis.getOptions().errorLabelClassName;
			var errorInputClass = tempThis.getOptions().errorInputClassName;
			$.each ( labelElements, function (index, value) {
				var key = $(value).attr('id').substring( tempThis.getOptions().errorLabelsPrefix.length );
				if (key in errors) {
					$(value).html( escapehtml (errors[key]) );
					if (errorLabelClass != "" && false == $(value).hasClass(errorLabelClass))
					{
						$(value).addClass(errorLabelClass);
					}					
				} else {
					$(value).html("");
					if (errorLabelClass != "")
					{
						$(value).removeClass(errorLabelClass);
					}
				}
			});
			
			var generalErrorItems = this.thisElement.find('[id="' + this.getOptions().generalError + '"]')
			if (generalErrorItems.length > 0) {
				if (errors[""]) {
					$(generalErrorItems).html( escapehtml(errors[""]));
					if (errorLabelClass != "" && false == $(generalErrorItems).hasClass(errorLabelClass))
					{
						$(generalErrorItems).addClass(errorLabelClass);
					}										
				} else {
					$(generalErrorItems).html("");
					if (errorLabelClass != "")
					{
						$(generalErrorItems).removeClass(errorLabelClass);
					}					
				}
			};
			var inputElements = this.thisElement.find('input[id^="' + this.getOptions().fieldsPrefix + '"]' + ',select[id^="' + this.getOptions().fieldsPrefix + '"]');
			$.each( inputElements, function (index, value) {
				var key = $(value).attr('id').substring( tempThis.getOptions().fieldsPrefix.length );
				if (key in errors) {
					if (errorInputClass != "" && false == $(value).hasClass(errorInputClass))
					{
						$(value).addClass(errorInputClass);
					}					
				} else {
					if (errorInputClass != "")
					{
						$(value).removeClass(errorInputClass);
					}
				}
			});
			
		},
		
		resetErrors: function ( ) {
			this.setErrors( );
		},
		
		validateFields: function ( ) {
			var returnObj = { };
			var validationRules = this.getOptions().validationRules;
			if (! validationRules) returnObj;			
			var tempThis = this;			
			$.each( validationRules , function (index, validationItemsForField) {
				
				key = tempThis.getOptions().fieldsPrefix + index;
				var elements = tempThis.thisElement.find('input[id^="' + key + '"]' + ',select[id^="' + key + '"]');
				$.each (elements, function ( i, elemVal) {
						var vres = tempThis.validateElement(elemVal, validationItemsForField);
						if (! $.isEmptyObject(vres)) {
							returnObj[index] = vres;
						}
				});				
			});
			return returnObj;
		},
		
		validateFieldsAndSetLabels: function ( errors ) {
			errors = errors || {};
			this.resetErrors();
			var validationErrors = this.validateFields();
			var textErrors = {};
			$.each(validationErrors, function (fieldName, fieldErrors) {
				for (index in fieldErrors) {
					if (! (fieldName in textErrors)) {					
						if (fieldErrors[index] in errors) {
							textErrors[fieldName] = errors[fieldErrors[index]];
							break;
						}
					}						
				}				
			});
			this.setErrors(textErrors);
			return textErrors;
		},
		
		validateElement: function (element, validations) {
			var textValue = undefined;
			var numberValue = undefined;
			var isSelected = undefined;
			var tempThis = this;
			var type = element.type || $(element).attr('type');
			switch (type) {
				case 'text':
				case 'file':
				case 'hidden':
				case 'password':
				case 'textarea':
				case 'select-multiple':
				case 'select-one':
					textValue = $(element).val();
					break;
				case 'checkbox':
				case 'radio':
					var name = $(element).attr('name');
					var checked = tempThis.thisElement.find('input[name^=' + name + ']:checked');
					if (checked.length == 1) {
							textValue = $(checked[0]).attr('value');
							isSelected = 1;
					}							
					break;

			}
			if (textValue && false  == isNaN(textValue)) {
				numberValue = new Number(textValue);
			}
			
			var errors = [];
			$.each (validations, function (index, validation) {			
				
				var obj = { 'value':textValue , 'validationValue': validation['rule'] };
				var key = "";
				for(var prop in validation['rule']) {
					key = prop;
					break;
				}
				if (key == 'length') {
					if (textValue.length != validation['rule'][key]) {
							errors.push(validation['error']);
						}
				}
				if (key == 'minLength') {
					if (textValue.length < validation['rule'][key]) {
							errors.push(validation['error']);
						}
				}
				if (key == 'maxLength') {
					if (textValue.length > validation['rule'][key]) {
							errors.push(validation['error']);
						}
				}
				if (key == 'rangeLength') {
					if (textValue.length > validation['rule'][key].max || textValue.length < validation['rule'][key].min) {
							errors.push(validation['error']);
					}
				}
				if (key == 'min') {
					if (! numberValue || numberValue < validation['rule'][key]) {
						obj['value'] = numberValue;
						errors.push(validation['error']);
					}
				}
				if (key == 'max') {
					if (! numberValue || numberValue > validation['rule'][key]) {
						obj['value'] = numberValue;
						errors.push(validation['error']);
					}
				}
				if (key == 'range') {
					if (! numberValue || numberValue < validation['rule'][key].min || numberValue > validation['rule'][key].max) {
						obj['value'] = numberValue;
						errors.push(validation['error']);
					}
				}
				if (key == 'equal') {
					if (! numberValue || numberValue != validation['rule'][key]) {
						obj['value'] = numberValue;
						errors.push(validation['error']);
					}
				}
				if (key == 'notEqual') {
					if (! numberValue || numberValue == validation['rule'][key]) {
						obj['value'] = numberValue;
						errors.push(validation['error']);
					}
				}
				if (key == 'startsWith') {
					if (0 != textValue.toLowerCase().indexOf(validation['rule'][key].toLowerCase())) {
						errors.push(validation['error']);
					}
				}
				if (key == 'endsWith') {
					if ( (textValue.length - validation['rule'][key].length) != textValue.toLowerCase().indexOf(validation['rule'][key].toLowerCase())) {
							errors.push(validation['error']);
						}
				}
				if (key == 'notContains') {
					if ( textValue.toLowerCase().indexOf(validation['rule'][key].toLowerCase()) >= 0) {
							errors.push(validation['error']);
						}
				}
				if (key == 'contains') {
					if ( textValue.toLowerCase().indexOf(validation['rule'][key].toLowerCase()) == -1) {
							errors.push(validation['error']);
						}
				}
				if (key == 'includedInto') {
					if (-1 == $.inArray(textValue, validation['rule'][key]))
					{	
						errors.push(validation['error']);
					}
				}
				if (key == 'notIncludedInto') {
					if (-1 != $.inArray(textValue, validation['rule'][key]))
					{	
						errors.push(validation['error']);
					}
				}
				if (key == 'customRegexp') {
					var r = new RegExp(validation['rule']['customRegexp'].pattern, validation['rule']['customRegexp'].modifiers);
					var b = r.test(textValue);
					if (false == b) {
						errors.push(validation['error']);
					}
				}			
			});
			return errors;
		}
	}
	$.fn.wbObjectManager = function ( param ) {
			var $this = $(this),
			data = $this.data('wbObjectManager');			
			var options = (typeof param == 'object') ? param : {} ; 
			if (!data) $this.data('wbObjectManager', (data = new WBObjectManager ($this, options)));	
			if (param == undefined) return data;
	}	
}) (window.jQuery);

 
(function ($) {

	WBDisplayObject = function ( thisElement, options ) {
		this.init( thisElement, options );
	}
	WBDisplayObject.prototype = 
	{
		defaults: { 
			fieldsPrefix: 'wb',
			customHandler: undefined
		},
		
		init: function ( thisElement, options ) {			
			this.thisElement = $(thisElement);
			this.options = $.extend ( {} , this.defaults, options );
		},
		getOptions: function () {
			if (! this.options) 
				return this.defaults
			else
				return this.options;
		},

		
		display: function (object) {
			var elements = this.thisElement.find('[id^="' + this.getOptions().fieldsPrefix + '"]');
			var tempThis = this;
			$.each( elements, function (index, value) {
				var key = $(value).attr('id').substring( tempThis.getOptions().fieldsPrefix.length );
				if (key in object) {
					var htmlField = ""; 
					if (tempThis.getOptions().customHandler) {
						htmlField = (tempThis.getOptions().customHandler)(key, object);
					} else {					
						htmlField = escapehtml(object[key]);
					}
					switch (value.type) {
					case 'text':
					case 'file':
					case 'hidden':
					case 'password':
					case 'textarea':
					case 'select-multiple':
					case 'select-one':
						$(value).val(htmlField);
						break;
					default:
						$(value).html(htmlField);
					}
				}				
			})
		}
	};
	
	$.fn.wbDisplayObject = function ( param ) {
			var $this = $(this),
			data = $this.data('wbDisplayObject');			
			var options = (typeof param == 'object') ? param : {} ; 
			if (!data) $this.data('wbDisplayObject', (data = new WBDisplayObject ($this, options)));	
			if (param == undefined) return data;
	}	

}) (window.jQuery);

(function ($) {
	WBCommunicationManager = function ( thisElement, options ) {
		this.init( thisElement, options );
	}
	
	WBCommunicationManager.prototype = 
	{
		defaults: { 
			url: "",
			functionSuccess: undefined,
			functionError: undefined,
			wbObjectManager: undefined,
			clientData: undefined
		},
		
		init: function ( thisElement, options ) {			
			this.thisElement = $(thisElement);
			this.options = $.extend ( {} , this.defaults, options );
		},
		
		getOptions: function () {
			if (! this.options) 
				return this.defaults
			else
				return this.options;
		},
		
		ajax : function ( options ) {	
			var thisElement = this;
			if (options.wbObjectManager) {
				options.wbObjectManager.setEditableFields(false);
			}
			
			$.ajax( { url: options.url , 
				  async: true,
			      contentType: 'application/json',
			  	  data: options.payloadData,
				  type: options.httpOperation,
				  dataType:"html",
				  error: function () {
					if (options.wbObjectManager) {
						options.wbObjectManager.setEditableFields(true);
					}
					// TBD define a communication issue
				  },
				  success: function(data) {
					if (options.wbObjectManager) {
						options.wbObjectManager.setEditableFields(true);
					}
					data = data || "{}";
					var retObject = JSON.parse(data);
					if (retObject.status == "OK") {							
						if (options.functionSuccess) {
							options.functionSuccess(JSON.parse(retObject.data),options.clientData);
						}
					}
					if (retObject.status == "FAIL") {
						if (options.functionError) {
							options.functionError(retObject.errors, JSON.parse(retObject.data), options.clientData);
						}						
					}
				  }
				});
		}		
	}

	$.fn.wbCommunicationManager = function ( params ) {
		var $this = $(this),
		data = $this.data('wbCommunicationManager');			
		var options = (typeof params == 'object') ? params : {} ; 
		if (!data) $this.data('wbCommunicationManager', (data = new WBCommunicationManager ($this, options)));	
		if (params == undefined) return data;
	}	
}) (window.jQuery);

(function ($) {

	WBTable = function ( thisElement, options ) {
		this.init( thisElement, options );
	}
	
	function notifyOperation(wbtable, operationName, object, keyName) {
		$.each(wbtable.notifiers, function(index, aNotifier) {
			aNotifier(operationName, object, keyName, wbtable.notifiersData[index]);
		});
	}
	
	WBTable.prototype = 
	{
		priv: { 
			intTableClass: "__wbTblclass",
			intPaginationClass: "__wbPagclass",
			wbinsert: 'insert',
			wbupdate: 'update',
			wbdelete: 'delete',
			wbdeleteAll: 'deleteAll'
		},
		defaults: {
			/*
			Array representing the table columns.
			Each column will have the format: {display:'column title', fieldId: 'objectFieldProperty'}
			display - String that will be displayed in the table header for this column
			fieldId - Each row is seen as an object, with the columns as the object properties. The value for the current column is the value of the fieldId object property 
			customHandling - spacifies if the html data for this column is constructed from the row object or by a customhandler callback. Value type is boolean. 
			customHandler - callback used to populate the column. The signature is function (fieldid, rowData). This isapplied only if customHandling = true
			*/
			columns : [], 
			/*
			Class that will be applied to the current table html element. Multiple classes can be specified i.e 'table-stripped table-bordered'
			*/
			tableBaseClass: "",
			/*
			If one of the row object properties identifies in a unique way the current row object among all table row objects then the property name can be specified as keyName.
			Find, update, delete operations on rows exists based on row key value.
			*/
			keyName: undefined,
			/*
			How many items to display per a table page
			*/
			itemsPerPage: 10,
			
			paginationBaseClass: "",
			
			textLengthToCut: 40
			},
		getOptions: function () {
			if (! this.options) 
				return this.defaults
			else
				return this.options;
		},
		init: function( thisElement, options) { 
			this.thisElement = thisElement;
			this.options = $.extend ( {} , this.defaults, options );	
			var header ='<tr>';
			$.each(this.getOptions().columns, function(index, item) {
				header += ('<th>' + escapehtml(item.display) + '</th>');
			});
			header += '</tr>';
			var html = ("<table class='{0} {1}'> <thead>{2}</thead><tbody></tbody></table> " +
					   "<div class='__wbPagclass {3}'> </div> ").format(this.priv.intTableClass, 
															  escapehtml(this.getOptions().tableBaseClass), 
															  header,
															  escapehtml(this.getOptions().paginationBaseClass));
			$(thisElement).html(html);
			
			var tableData = new Array();
			this.thisElement.data('tableData', tableData);
			
			this.notifiers = new Array();
			this.notifiersData = new Array();
			this.currentPageIndex = 0;
		},
		getPageFromIndex: function (recordIndex) {
			// given a record index, in which page this record belongs ?
			if (this.getOptions().itemsPerPage>0) {
				return Math.floor(recordIndex / this.getOptions().itemsPerPage);
			} else			
				return 0;
		},
		clearRows: function() {
			this.setRows();
		},
		clearNotifiers: function () {
			this.notifiers = [];
			this.notifiersData = [];
		},
		removeNotifier: function (notifierData) {
			var tempThis = this;
			$.each( tempThis.notifierData, function (index, item) {
				if (notifierData == item) {
					tempThis.notifiers.splice(index, 1);
					tempThis.notifiersData.splice(index, 1);
					return;
				}
			});
		},
		addNotifier: function (notifier, notifierData) {
			this.notifiers.push(notifier);
			this.notifiersData.push(notifierData);
		},
		appendRows: function(recordSet, startIndex) {
			recordSet = recordSet || [];
			var tempThis = this;
			if (startIndex == undefined || startIndex > tempThis.thisElement.data('tableData').length) {
				startIndex = tempThis.thisElement.data('tableData').length;
			}
			$.each (recordSet, function (index, item) {
				var bAdded = false;
				tempThis.thisElement.data('tableData').splice(startIndex+index,0, item);
				notifyOperation(tempThis, tempThis.priv.wbinsert, item, tempThis.getOptions().keyName);											
			});			
			var start = tempThis.currentPageIndex*tempThis.getOptions().itemsPerPage;
			if (startIndex < start + tempThis.getOptions().itemsPerPage) {
				tempThis.displayTable();
			}
			tempThis.displayPagination();
			
		},
		displayTable: function (pageIndex) {
			var tempThis = this;
			if (pageIndex == undefined) {
				pageIndex = tempThis.currentPageIndex;
			}
			$(tempThis.thisElement).children('table').children('tbody').html("");
			var elements = tempThis.thisElement.data('tableData');
			var start = pageIndex*tempThis.getOptions().itemsPerPage;
			var maxLength = tempThis.getOptions().textLengthToCut;
			for( var i = start; (i < elements.length) && i < (start + tempThis.getOptions().itemsPerPage); i++)
			{
				var html = '<tr>';
				var columns = tempThis.getOptions().columns;				
				for(var x = 0; x< columns.length; x++) {
					
					var value = "";
					if (columns[x].customHandling == true && columns[x].customHandler) {
						value = (columns[x].customHandler)(columns[x].fieldId, elements[i]);
					} else {
						value = "" + elements[i][columns[x].fieldId];
						if (value.length > maxLength) {
							value = value.substring(0,maxLength);
							value += "...";
						}
						value = escapehtml(value);

					}
					html += ('<td>' + value + '</td>');
				}
				html += '</tr>';	
				$(tempThis.thisElement).children('table').children('tbody').append(html);
			}
			tempThis.currentPageIndex = pageIndex;
		},
		displayPagination: function (pageIndex) {
			pageIndex = pageIndex || this.currentPageIndex;
			var tempThis = this;
			var countPages = Math.ceil (tempThis.thisElement.data('tableData').length / tempThis.getOptions().itemsPerPage);
			var html = '<ul>';
			var startIndex = 0;
			var endIndex = countPages;
			for (var i = startIndex; i< countPages; i++) {
				if (i != pageIndex) {
					html += '<li> <a href="#"> {0} </a> </li>'.format(i+1);
				} else {
					html += '<li class="active"> <a href="#">{0}</a></li>'.format(i+1);
				}				
			}
			html += '</ul>';
			$(tempThis.thisElement).children('.__wbPagclass').html(html);
			$(tempThis.thisElement).children('.__wbPagclass').data('tempThis', this);
			$(tempThis.thisElement).find('.__wbPagclass a').click (function () { 
				if ($(this).parent().hasClass('active')) {
					return;
				}
				var tempThis = $(this).parent().parent().parent().data('tempThis');
				tempThis.changePage(parseInt($(this).text()) - 1);
			});
		},
		changePage: function (pageIndex) {
			this.displayTable(pageIndex);
			this.displayPagination(pageIndex);
		},
		setRows: function(recordSet) {
			recordSet = recordSet || [];
			var tempThis = this;
			$(tempThis.thisElement).children('table').children('tbody').html("");
			this.currentPageIndex = 0;
			var len = tempThis.thisElement.data('tableData').length;
			tempThis.thisElement.data('tableData', []);
			notifyOperation(tempThis, tempThis.priv.wbdeleteAll, undefined, undefined);			
			this.appendRows(recordSet);			
		},
		updateRow: function(row, index) {
			var tempThis = this;				
			var elements = tempThis.thisElement.data('tableData');
			if (index != undefined && index < elements.length) {
				this.thisElement.data('tableData')[index] = row;
				notifyOperation(tempThis, tempThis.priv.wbupdate, row, tempThis.getOptions().keyName);
				var start = tempThis.currentPageIndex* tempThis.getOptions().itemsPerPage;
				if ((index >= start) && (index < start + tempThis.getOptions().itemsPerPage)) {
					tempThis.displayTable();
				}
			}							
		},
		insertRow: function(row, startIndex) {
			var recordSet = [ row ];
			this.appendRows(recordSet, startIndex);
		},
		deleteRow: function(index) {
			var tempThis = this;
			if (index != undefined && index < this.thisElement.data('tableData').length) {
				var itemData = this.thisElement.data('tableData')[index];
				notifyOperation(tempThis, tempThis.priv.wbdelete, itemData, tempThis.getOptions().keyName);
				this.thisElement.data('tableData').splice(index,1);	
				var start = tempThis.currentPageIndex* tempThis.getOptions().itemsPerPage;
				if (index < start + tempThis.getOptions().itemsPerPage) {
					tempThis.displayTable();
				}

			}				
		},
		getRowData: function (index) {
			var array = this.thisElement.data('tableData');
			if (0<=index && index < array.length) {
				return array[index];
			}			
			return undefined;
		},
		getAllRowsData: function () {
			var array = this.thisElement.data('tableData');
			return array;
		},		
		findIndexWithKey: function(key) {
			var tempThis = this;
			var array = this.getAllRowsData();
			var idx = -1;
			$.each (array, function (index, value) {
				if (value[tempThis.getOptions().keyName] == key) {
					idx = index;
					return false;
				}			
			});
			return idx;	
		},
		updateRowWithKey: function (row, key) {
			var idx = this.findIndexWithKey(key);
			if (idx >=0) {
				this.updateRow(row, idx);
				return idx;
			}
			return -1;
		},
		deleteRowWithKey: function (key) {
			var idx = this.findIndexWithKey(key);
			if (idx >=0) {
				this.deleteRow(idx);
				return idx;
			}
			return -1;
		},
		getRowDataWithKey: function (key) {
			var idx = this.findIndexWithKey(key);
			if (idx >=0) {
				return this.getRowData(idx);
			}
			return undefined;			
		}
		
	};
	
	$.fn.wbTable = function ( param ) {
			var $this = $(this),
			data = $this.data('wbTable');			
			var options = (typeof param == 'object') ? param : {} ; 
			if (!data) $this.data('wbTable', (data = new WBTable ($this, options)));	
			if (param == undefined) return data;
	}	
})(window.jQuery)