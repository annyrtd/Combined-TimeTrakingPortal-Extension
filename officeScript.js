// OVERWRITES old selecor
jQuery.expr[':'].contains = function(a, i, m) {
	return jQuery(a).text().toUpperCase()
		.indexOf(m[3].toUpperCase()) >= 0;
};


// для сортировки колонок
function mergeSort(arrayToSort, compare) 
{
    var length = arrayToSort.length,
        middle = Math.floor(length / 2);

    if (!compare) {
      compare = function(left, right) {
        if (left < right)
          return -1;
        if (left == right)
          return 0;
        else
          return 1;
      };
    }

    if (length < 2)
      return arrayToSort;

    return merge(
      mergeSort(arrayToSort.slice(0, middle), compare),
      mergeSort(arrayToSort.slice(middle, length), compare),
      compare
    );
  }

function merge(left, right, compare) 
{
    var result = [];

    while (left.length > 0 || right.length > 0) {
      if (left.length > 0 && right.length > 0) {
        if (compare(left[0], right[0]) <= 0) {
          result.push(left[0]);
          left = left.slice(1);
        }
        else {
          result.push(right[0]);
          right = right.slice(1);
        }
      }
      else if (left.length > 0) {
        result.push(left[0]);
        left = left.slice(1);
      }
      else if (right.length > 0) {
        result.push(right[0]);
        right = right.slice(1);
      }
    }
    return result;
}


// Добавляет поле для ввода для поиска по имени
function CreateSearchInput_withMD()
{
	var input = $("<input>", {
		type: "text",
		"class": "mdl-textfield__input",
		id: "searchInput"
	});
	
	var labelForInput = $("<label></label>", {
		"class": "mdl-textfield__label",
		"for": "searchInput",
		"style": "line-height: 12pt !important;"
	}).append('Сотрудник');	
	
	var icon = $('<i class="material-icons" style="float: left; margin-top: 22px;">search</i>');
	
	var div = $("<div></div>", {
		"class": "mdl-textfield mdl-js-textfield"
	}).append(input, labelForInput);
	
	
	$("th.text").eq(0).children().hide();
	$("th.text").eq(0).append(icon,div);
	
	componentHandler.upgradeElement($(".mdl-textfield.mdl-js-textfield").get(0));
	
	ChangeTitleToMDTooltip("searchInput", 
		"Введите фамилию <br>или имя сотрудника");
}



function escapeHtml(text) 
{
	var map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
	};

	return text.replace(/[&<>"']/g, function(symbol) 
	{ 
		return map[symbol]; 
	});
}


// добавляет классы для колонок, по которым производится поиск и сортировка
function SetClassesOnColumns()
{
	var header = " header";
	
	
	$("th.text").first().addClass("employee header");
	$("col.text").first().addClass("employee");
	$('tbody tr').each(
		function(index)
		{
			$(this).children("td.text").first().addClass("employee");
		}
	);
	
	$("th.text").eq(1).addClass("info");
	$("col.text").eq(1).addClass("info");
	$('tbody tr').each(
		function(index)
		{
			$(this).children("td.text").eq(1).addClass("info");
		}
	);	

	
	
	$("th.text.phone").first().addClass("first");
	$("col.text.phone").first().addClass("first");
	$('tbody tr').each(
		function(index)
		{
			$(this).children("td.text.phone").first().addClass("first");
		}
	);	
	
	$("th.text.phone").eq(1).addClass("second");
	$("col.text.phone").eq(1).addClass("second");
	$('tbody tr').each(
		function(index)
		{
			$(this).children("td.text.phone").eq(1).addClass("second");
		}
	);
	
	$("th.text.phone").eq(2).addClass("third");
	$("col.text.phone").eq(2).addClass("third");
	$('tbody tr').each(
		function(index)
		{
			$(this).children("td.text.phone").eq(2).addClass("third");
		}
	);

	
	
	$("th.text").eq(5).addClass("workgroup header");
	$("col.text").eq(5).addClass("workgroup");
	$('tbody tr').each(
		function(index)
		{
			$(this).children("td.text").eq(5).addClass("workgroup");
		}
	);
	
	$("th.text").eq(6).addClass("room header");
	$("col.text").eq(6).addClass("room");
	$('tbody tr').each(
		function(index)
		{
			$(this).children("td.text").eq(6).addClass("room");
		}
	);
	
	
	$("th.indicator").first().addClass("workstate header");
	$("col.indicator").first().addClass("workstate");
	$('tbody tr').each(
		function(index)
		{
			$(this).children("td.indicator").first().addClass("workstate");
		}
	);
	
	$("th.indicator").last().addClass("mail");
	$("col.indicator").last().addClass("mail");
	$('tbody tr').each(
		function(index)
		{
			$(this).children("td.indicator").last().addClass("mail");
		}
	);
}	


// добавляют select на колонки 
function CreateSelectForGroups() {
	var arrayOfGroupNames = GetGroupNames();
	
	var button, tooltip;
	if (IsMyHomeOffice())
	{
		button = $('<button style="float: left;" id="groupSelectButton" class="mdl-button mdl-js-button mdl-button--icon' 
			+'  mdl-button--accent mdl-js-ripple-effect"><i class="material-icons">group</i></button>');
		tooltip = $('<div class="mdl-tooltip" for="groupSelectButton">Моя группа</div>');	
	}
	
	
	var select = $("<select></select>", {
		id: "workgroupSelect",
		title: "Выберите группу"
	})
	.append("<option value=''>Группа</option>");
	
	for (var i = 0; i < arrayOfGroupNames.length; i++)
	{
		if (arrayOfGroupNames[i] != "")
		{
			select.append("<option value='" + arrayOfGroupNames[i] + "'>" + arrayOfGroupNames[i] + "</option>");
		}
		else
		{			
			select.append("<option value='NoGroup'>---</option>");
		}
	}
	
	$("th.text").eq(5).children().hide();
	
	if (button !== undefined && tooltip !== undefined)
	{
		$("th.text").eq(5).append(button, tooltip, select);
		componentHandler.upgradeElement(button.get(0));
		componentHandler.upgradeElement(tooltip.get(0));	
	}	
	else
	{
		$("th.text").eq(5).append(select);
	}
}

function GetGroupNames() {
	
	var arrayOfGroupNames = [];
	
	$("table.full-size > tbody > tr").each(
		function (index)
		{
			var newOption = $(this).children("td.workgroup").text();
			if (arrayOfGroupNames.indexOf(newOption) < 0)
			{
				arrayOfGroupNames.push(newOption)
			}
		}
	);
	
	arrayOfGroupNames.sort();
	
	return arrayOfGroupNames;
}

function CreateSelectOnWorkState() {
	var select = $("<select></select>", {
		id: "workStateSelect",
		title: 'Выберите состояние'
	})
	.append("<option value=''></option>")	
	.append("<option id='option_ball_green' value='/Content/ball_green.png'>На работе</option>")
	.append("<option id='option_ball_blue' value='/Content/ball_blue.png'>Работает удаленно</option>")
	.append("<option id='option_ball_yellow' value='/Content/ball_yellow.png'>Закончил работу</option>")
	.append("<option id='option_ball_gray' value='/Content/ball_gray.png'>Отсутствует</option>");
	
	$("th.indicator").eq(0).append(select);
}

function CreateSelectOnRoom() {
	var arrayOfRoomNumbers = GetRoomNumbers();
	
	var button, tooltip;
	if (IsMyHomeOffice())
	{
		button = $('<button style="float: left;" id="roomSelectButton" class="mdl-button mdl-js-button mdl-button--icon' 
			+'  mdl-button--accent mdl-js-ripple-effect"><i class="material-icons">weekend</i></button>')
		tooltip = $('<div class="mdl-tooltip" for="roomSelectButton">Моя комната</div>');	
	}
	
	var select = $("<select></select>", {
		id: "roomSelect",
		title: "Выберите номер комнаты"
	})
	.append("<option value=''>Комната</option>");
	
	for (var i = 0; i < arrayOfRoomNumbers.length; i++)
	{
		if (arrayOfRoomNumbers[i] != "")
		{
			select.append("<option value='" + arrayOfRoomNumbers[i] + "'>" + arrayOfRoomNumbers[i] + "</option>");
		}
		else
		{			
			select.append("<option value='NoRoom'>---</option>");
		}
	}
	
	$("th.text").eq(6).children().hide();
	if (button !== undefined && tooltip !== undefined)
	{
		$("th.text").eq(6).append(button, tooltip, select);
		componentHandler.upgradeElement(button.get(0));
		componentHandler.upgradeElement(tooltip.get(0));
	}
	else
	{		
		$("th.text").eq(6).append(select);
	}
}

function GetRoomNumbers() {
	
	var arrayOfRoomNumbers = [];
	
	$("table.full-size > tbody > tr").each(
		function (index)
		{
			var newOption = $(this).children("td.room").text();
			if (arrayOfRoomNumbers.indexOf(newOption) < 0)
			{
				arrayOfRoomNumbers.push(newOption)
			}
		}
	);
	
	arrayOfRoomNumbers.sort();
	
	return arrayOfRoomNumbers;
}

function IsMyHomeOffice()
{
	var myName = GetMyName();
	if ($('td.employee:contains("' + myName + '")').length > 0)
	{
		return true;
	}
	return false;
}

function CreateSelectOnGender() {
	var select = $("<select></select>", {
		id: "genderSelect",
		title: 'Выберите пол'
	})
	.append("<option value=''>Все</option>")	
	.append("<option value='man'>Мужчины</option>")
	.append("<option value='woman'>Женщины</option>");
	
	$("th.text.info").first().append(select);
}


// добавляют стрелочки для сортировки
function PrepareEmployeeColumnForSort()
{
	var arrowDiv = $("<div></div>",
	{
		"class": "arrowDiv"
	}).css({
		"float": "right",
		"margin": "20px 0px",
		"backgroundImage": "url(" + chrome.extension.getURL("/images/bg.gif") + ")"
	});
	
	var clearfix = $("<div></div>",
	{
		"class": "clearfix"		
	});
	
	$("#searchInput").css("float", "left");
	$("#searchInput").parent().after(arrowDiv, clearfix);
	
}

function PrepareWorkgroupColumnForSort()
{
	var arrowDiv = $("<div></div>",
	{
		"class": "arrowDiv"
	}).css("float", "right")
	.css("backgroundImage", "url(" + chrome.extension.getURL("/images/bg.gif") + ")");
 	
	var clearfix = $("<div></div>",
	{
		"class": "clearfix"		
	});
	
	$("#workgroupSelect").css("float", "left");
	$("#workgroupSelect").after(arrowDiv, clearfix);
}

function PrepareRoomColumnForSort()
{
	var arrowDiv = $("<div></div>",
	{
		"class": "arrowDiv"
	}).css("float", "right")
	.css("backgroundImage", "url(" + chrome.extension.getURL("/images/bg.gif") + ")");
	
	var clearfix = $("<div></div>",
	{
		"class": "clearfix"		
	});
	
	$("#roomSelect").css("float", "left");
	$("#roomSelect").after(arrowDiv, clearfix);
}


// убирает пустые колонки
function RemoveEmptyColumns()
{
	$("table.full-size > thead th").each(
		function(index)
		{
			var shouldBeHidden = true;
			$("table.full-size > tbody > tr").each(
				function (index2)
				{
					if ($(this).children("td").eq(index).html() != "")
					{
						shouldBeHidden = false;
					}						
				}			
			);
			
			if (shouldBeHidden)
			{
				$(this).hide();
				$("table.full-size > tbody > tr").each(
					function (index2)
					{
						$(this).children("td").eq(index).hide();			
					}			
				);				
			}
			
		}
	);
}

// определяет, какую колонку нужно отсортировать
function GetColumnToSort(currentHeader)
{
	if ($(currentHeader).hasClass("employee"))
		return "employee";
	if ($(currentHeader).hasClass("workgroup"))
		return "workgroup";
	if ($(currentHeader).hasClass("room"))
		return "room";
}


function AddResetFiltersButton()
{
	var icon = $('<i class="material-icons">clear</i>');
	
	var button = $("<button></button>", 
	{
		"id": "idReset",
		"class": "mdl-button mdl-js-button  mdl-button--fab mdl-button--icon mdl-button--accent  mdl-js-ripple-effect",
		type: "button"
	}).append(icon);	
	
	var div = $("<div></div>",
	{
		"class": "buttonDiv"
	}).append(button).css("width", "100%");

	$("table.full-size colgroup").append('<col class="reset button">');
	$("table.full-size thead tr").append('<th class="reset button"></th>');
		
	$('th.reset.button').append(div);
	
	$("table.full-size tbody tr").each(
		function()
		{
			$(this).append('<td class="reset button"></td>');
		}
	);
	
	var tooltip = $('<div class="mdl-tooltip" for="idReset">Сбросить<br>фильтры</div>');
	
	componentHandler.upgradeElement(tooltip.get(0));
	componentHandler.upgradeElement(button.get(0));
	$('th.reset.button').append(tooltip);
	$("button#idReset").hide();	
}


// фильтры
function SetFilters()
{
	$("table.full-size > tbody > tr").show();
	$("div.card-square").show();
	
	$("#searchInput").val("");
	$("#card-searchInput").val("");
	FilterGroup();
	FilterWorkState();
	FilterRoom();
	FilterGender();


	function FilterGroup()
	{
		var inputText = $("select#workgroupSelect option").filter(":selected").val();
		
		if (inputText == "")
		{
			return;
		}
		
		if (inputText == "NoGroup")
		{
			$('td.workgroup')
			.not('[style~="display: none;"]').each(
				function(index)
				{
					if ($(this).text() != "")
						$(this).parent().hide();
				}
			);
			
			$('.card-square')
			.not('[style~="display: none;"]')
			.each(
				function()
				{
					if ($(this).find('span.workgroup').length)
					{
						$(this).hide();
					}
				}
			);		
			
			return;
		}
		var cellsThatContainInputText = 'td.workgroup:contains("' + inputText + '")';			
		$('td.workgroup').not(cellsThatContainInputText).parent().hide();
		
		$('.card-square')
		.not('[style~="display: none;"]')
		.each(
			function()
			{
				if ($(this).find('span.workgroup').first().text()				
						!= inputText) 
				{
					$(this).hide();
				}
			}
		);	
	}

	function FilterWorkState()
	{	
		var inputText = $("select#workStateSelect option").filter(":selected").val();
		
		if (inputText == "")
		{
			$("select#workStateSelect").attr("title", "Выберите состояние");
			$("th.workstate i")
			.css("color", "white")
			.attr("title", "Выберите состояние")
			.css("textShadow", "-1px 0 gray, 0 1px gray, 1px 0 gray, 0 -1px gray");
			return;
		}
		
		$("tbody tr")
		.not('[style~="display: none;"]')
		.each(
			function(index)
			{
				if ($(this).children("td.indicator").first().children("img").attr("src").indexOf(inputText) <= -1)
				{					
					$(this).hide();
				}
			}
		);
		
		$(".card-square")
		.not('[style~="display: none;"]')
		.each(
			function(index)
			{
				if ($(this).find('.circular').attr('datavalue').indexOf(inputText) <= -1) {								
					$(this).hide();
				}
			}
		);
		
		var newTitle = $("select#workStateSelect option").filter(":selected").attr("title");
		var color = $("select#workStateSelect option").filter(":selected").attr("id").replace("option_ball_", "");
		switch(color)
		{
			case "green":
				color = "#8bc349";
				break;
			case "blue":
				color = "rgb(63, 81, 181)";
				break;
			case "yellow":
				color = "#ffeb3b";
				break;
		}
		$("select#workStateSelect").attr("title", newTitle);
		$("th.workstate i")
		.css("color", color)
		.attr("title", newTitle)
		.css("textShadow", "none");
	}

	function FilterRoom()
	{					
		var inputText = $("select#roomSelect option").filter(":selected").val();
		
		if (inputText == "")
		{
			return;
		}
		
		if (inputText == "NoRoom")
		{
			$('td.room')
			.not('[style~="display: none;"]')
			.each(
				function(index)
				{
					if ($(this).text() != "")
						$(this).parent().hide();
				}
			);
			
			$('.card-square')
			.not('[style~="display: none;"]')
			.each(
				function()
				{
					if ($(this).find('span.room').length)
					{
						$(this).hide();
					}
				}
			);	
			
			return;
		}
		var cellsThatContainInputText = 'td.room:contains("' + inputText + '")';		
		$('td.room').not(cellsThatContainInputText).parent().hide();

		$('.card-square')
		.not('[style~="display: none;"]')
		.each(
			function()
			{
				if ($(this).find('span.room').first().text()				
						!= inputText) 
				{
					$(this).hide();
				}
			}
		);		
	}
	
	function FilterGender()
	{					
		var inputText = $("select#genderSelect option").filter(":selected").val();
		
		if (inputText == "")
		{
			return;
		}
		
		$('table.full-size tbody tr')
		.not('[style~="display: none;"]')
		.each(
			function()
			{
				var employee = $(this).find('td.employee').text();
				var card = $('.card-square:contains(' + employee + ')').first();
				if (card.find('.' + inputText).length <= 0) {
					$(this).hide();
					card.hide();
				}				
			}
		);
	}	
}


//Выбор "домашних" групп и комнат

function SelectHomeGroup()
{
	$("table.full-size > tbody > tr").show();
	$("div.card-square").show();
	$("#searchInput").val("");
	$("#card-searchInput").val("");

	var inputText = GetMyGroupName();
	$("#workgroupSelect").val(inputText ? inputText : "NoGroup" );
	$('#groupMenuSpan').text(inputText ? inputText : "---");

	if (inputText == "") {
		$('td.workgroup')
		.not('[style~="display: none;"]')
		.each(
			function(index)
			{
				if ($(this).text() != "")			
					$(this).parent().hide();
			}
		);

		$('.card-square')
		.not('[style~="display: none;"]')
		.each(
			function()
			{
				if ($(this).find('span.workgroup').length)
				{
					$(this).hide();
				}
			}
		);
		return;
	}
	
	
	var cellsThatContainInputText = 'td.workgroup:contains("' + inputText + '")';				
	$('td.workgroup').not(cellsThatContainInputText).parent().hide();	
	
	$('.card-square')
	.not('[style~="display: none;"]')
	.each(
		function()
		{
			if ($(this).find('span.workgroup').first().text()				
					!= inputText) 
			{
				$(this).hide();
			}
		}
	);	

	function GetMyGroupName()
	{
		var groupname = "";
		var myName = GetMyName();
		
		$('td.workgroup').each(
			function(index)
			{
				if ($(this).parent().children("td.employee").text() == myName)
				{
					groupname = $(this).text();
					return false;
				}
			}
		);
		return groupname;
	}

}

function GetMyName()
{
	var myName = $(".status-right a").text();
	
	var position = myName.indexOf(" ");
	var firstName = myName.substr(0, position);
	var lastName = myName.substr(position + 1);
	myName = lastName + " " + firstName;
	
	return myName;
}

function SelectHomeRoom()
{
	$("table.full-size > tbody > tr").show();
	$("div.card-square").show();
	$("#searchInput").val("");
	$("#card-searchInput").val("");
	
	var inputText = GetMyRoomNumber();
	$("#roomSelect").val(inputText ? inputText : "NoRoom");
	$('#roomMenuSpan').text(inputText ? inputText : "---");

	if (inputText == "") {
		$('td.room')
		.not('[style~="display: none;"]')
		.each(
			function(index)
			{
				if ($(this).text() != "")		
					$(this).parent().hide();
			}
		);
		$('.card-square')
		.not('[style~="display: none;"]')
		.each(
			function()
			{
				if ($(this).find('span.room').length)
				{
					$(this).hide();
				}
			}
		);

		return;
	}

	var cellsThatContainInputText = 'td.room:contains("' + inputText + '")';			
	$('td.room').not(cellsThatContainInputText).parent().hide();	
	
	$('.card-square')
	.not('[style~="display: none;"]')
	.each(
		function()
		{
			if ($(this).find('span.room').first().text()				
					!= inputText) 
			{
				$(this).hide();
			}
		}
	);


	function GetMyRoomNumber()
	{
		var roomNumber = "";
		var myName = GetMyName();
		
		$('td.room').each(
			function(index)
			{
				if ($(this).parent().children("td.employee").text() == myName)
				{
					roomNumber = $(this).text();
					return false;
				}
			}
		);

		return roomNumber;
	}

}

function CreateMDLCard()
{
	$(".status-center").hide();
	$(".main").hide();
	
	var header = $('<span></span>',
	{
		"class": "mdl-layout-title"
	}).append($(".status-center").text());
	
	$("table.full-size").addClass("mdl-shadow--2dp");	
	$(".mdl-layout__content").append(header, $("table.full-size"));
}



function ResizeTableHeader()
{
	var $table = $('table.full-size'),
		$bodyCells = $table.find('tbody tr').not('[style~="display: none;"]').first().children(),
		colWidth;
				
	colWidth = $bodyCells.map(
		function() 
		{
			return $(this).width();
		}
	).get();
		
	// Set the width of thead columns
	$table.find('th').each(
		function(i, v) 
		{
			$(v).width(colWidth[i]);
		}
	);  
}

function CreateSettingsForLangAndDisplay()
{
	$("div.mdl-layout__drawer").append($("<div id=settings></div>"));
	$("#settings").load("http://co-msk-app02/Preferences/Edit form", 
		function()
		{
			$("#settings").hide();
			$("#settings").prepend("<br><br><label><b>Настройки:</b></label>");
			$("#ReturnTo").val("/" + window.location.search);
			$("#settings a").hide();
			$("#settings label").removeAttr("for");
			$("#settings label").after("<br>");
			$("div.table-form").last().next().css(
			{
				paddingTop: "2em"
			});
			
			$("div.table-form").hide();
			$("div.table-form").first().show();
			$("div.table-form").eq(4).show();
			
			$("div.table-form").eq(4).children('label').text('Вид по умолчанию:')
			$('select#SummaryWithoutToday option[value=No]').text('Таблица');
			$('select#SummaryWithoutToday option[value=Yes]').text('Карточки');
			
			var office;
			
			if ($('head title').first().text().toLowerCase().indexOf('ярославль') > -1)
			{
				office = 'isRussianEquivalentSet_Yar';
				if ($('#ListLanguage').children('option:selected').val() == 'English') {
					if (localStorage[office]) {
						SetGenderForEnglishLanguage();
					} else {
						$('.genderMenu').remove();
						$('.rowDiv i.man').parent().remove();
						$('.rowDiv i.woman').parent().remove();
					}
				} else {
					SetRussianEquivalentForEnglishNames(office);
				}
			} else {
				office = 'isRussianEquivalentSet_Msk';
				if ($('#ListLanguage').children('option:selected').val() == 'English') {
					if (localStorage[office]) {
						SetGenderForEnglishLanguage();
					} else {
						$('.genderMenu').remove();
						$('.rowDiv i.man').parent().remove();
						$('.rowDiv i.woman').parent().remove();
					}
				} else {
					SetRussianEquivalentForEnglishNames(office);
				}				
			}
			
			
			ChangeTableCardMode();
			
			ReplaceInput.apply($("form[action='/Preferences/Edit'] input[type=submit]").get(0));
			ChangeButtonsToMD.apply($("form[action='/Preferences/Edit'] button.inputReplaceButton").get(0));
			
			$("form[action='/Preferences/Edit'] button.inputReplaceButton").parent()
			.css("width", "0px");	
			$("#settings").fadeIn("fast");
		}
	);
}

function SetTableHeightForOffice()
{
	var tbody = $("table.full-size tbody");
	
	var height = $(window).height()
		- $('header.mdl-layout__header').outerHeight(true)
		- $('main.mdl-layout__content.content-wide span.mdl-layout-title').outerHeight(true)
		- $('table.full-size thead').outerHeight(true)
		- $('.holiday-box').outerHeight(true)
		//- $('div.toggle').outerHeight(true)
		- 50; 
	
	tbody.height(height);
	if (tbody.get(0).scrollHeight <= tbody.get(0).clientHeight)
	{
		tbody.css('height', 'auto');
	}
}

function CheckResetButton()
{
	if ($("#workgroupSelect").val() != "" ||
	$("#workStateSelect").val() != "" ||
	$("#roomSelect").val() != "" || 
	$("#genderSelect").val() != "" || 
	$("#searchInput").val() != "" ||
	$("#card-man").hasClass('checked') ||
	$("#card-woman").hasClass('checked') ||
	$("#card-searchInput").val() != "")
	{
		$("button#idReset").fadeIn("fast");
		$("button#card-idReset").fadeIn("fast");
	}
	else
	{
		$("button#idReset").fadeOut("fast");
		$("button#card-idReset").fadeOut("fast");
	}

}

function AddBorderToStatusSelect()
{
	var span = $("<span></span>").css({
		"display": "block",
		"border": "1px solid rgb(202, 202, 202)",
		"paddingLeft": "3px",
		"borderRadius": "2px"
	}).append($("th.indicator.workstate.header").children());
	
	$("th.indicator.workstate.header").append(span);
}



function AddTooltips_officeScript()
{
	$("tbody i:contains('email')").each(
		function(index)
		{			
			if ($(this).attr("title") === undefined)
			{
				return true;
			}
			var id = "i_email_" + index;
			var title = $(this).attr("title");
			$(this).removeAttr("title");
			$(this).attr("id", id);
			ChangeTitleToMDTooltip(id, title);			
		}
	);
	
	$("tbody i:contains('lens')").each(
		function(index)
		{			
			if ($(this).attr("title") === undefined)
			{
				return true;
			}
			var id = "i_lens_" + index;
			var title = $(this).attr("title");
			$(this).removeAttr("title");
			$(this).attr("id", id);
			ChangeTitleToMDTooltip(id, title);			
		}
	);
	
	$("select").each(
		function(index)
		{
			if ($(this).attr("title") === undefined)
			{
				return true;
			}
			var id = $(this).attr("id");
			var title = $(this).attr("title");
			$(this).removeAttr("title");
			ChangeTitleToMDTooltip(id, title);			
		}
	);
	
	$('span.hidden-text')
	.each(
		function(index)
		{
			if ($(this).attr("title") === undefined)
			{
				return true;
			}
			var id = "span_hidden-text_" + index;
			var title = $(this).attr("title");
			$(this).removeAttr("title");
			$(this).attr("id", id);
			ChangeTitleToMDTooltip(id, title);			
		}
	);
	
}

function ResetTableParametres()
{
	$('.card-square').show();
	$("table.full-size > tbody > tr").show();
	$("#workgroupSelect, #workStateSelect, #roomSelect, #genderSelect").val("");
	$('#workstateMenu').attr('datavalue', '')
	$('#stateMenuSpan').text('Статус')
	$('#groupMenuSpan').text('Группа');
	$('#roomMenuSpan').text('Комната');
	
	$('#card-man, #card-woman').removeClass('checked');			
	$('#card-allpeople').addClass('checked');
				
	$("#searchInput").val("").parent().removeClass("is-dirty");
	$("#card-searchInput").val("").parent().removeClass("is-dirty");
	
	$("th.workstate i")
	.css("color", "white")
	.css("textShadow", "-1px 0 gray, 0 1px gray, 1px 0 gray, 0 -1px gray");
}


// Добавление меню для смены таблицы/карточек
function AddToggleButtonTableAndCards()
{
	var icon1 = $('<i id="table-icon" class="material-icons">list</i>');
	var icon2 = $('<i id="card-icon" class="material-icons">apps</i>');
	
	var button1 = $('<button></button>', {
		id: 'table-button',
		'class': 'mdl-button mdl-js-button mdl-button--icon mdl-button--accent mdl-button--fab mdl-js-ripple-effect'
	}).append(icon1); 
	
	var button2 = $('<button></button>', {
		id: 'card-button',
		'class': 'mdl-button mdl-js-button mdl-button--icon mdl-button--accent mdl-js-ripple-effect'
	}).append(icon2); 
	
	var div = $('<div id="toggle-div" class="toggle"></div>')
	.append(button1, button2);
	
	$('main > span.mdl-layout-title')
	.css({ 
		display: 'flex',
		alignItems: 'center',
		flexWrap: 'wrap',
		minHeight: '65px'
	})
	.append(div);
	
	var tooltip1 = $('<div id="toggle-tooltip" class="mdl-tooltip" for="table-button">Отображать <br>таблицей</div>');
	var tooltip2 = $('<div id="toggle-tooltip" class="mdl-tooltip" for="card-button">Отображать <br>карточками</div>');
	
	
	componentHandler.upgradeElement(button1.get(0));
	componentHandler.upgradeElement(button2.get(0));
	componentHandler.upgradeElement(tooltip1.get(0));
	componentHandler.upgradeElement(tooltip2.get(0));
	
	div.append(tooltip1, tooltip2);
	
	
	if ($('select#SummaryWithoutToday').length > 0) {
		ChangeTableCardMode();
	}
}

function ChangeTableCardMode() 
{
	if ($('select#SummaryWithoutToday option:selected').val() == 'No') {
		$('#table-button').click();
		$('.mdl-tooltip.is-active').removeClass('is-active');
	} else {
		$('#card-button').click();
		$('.mdl-tooltip.is-active').removeClass('is-active');
	}
}


// Добавление карточек работников
function SetWorkerCards()
{
	var div = $('<div></div>', {
		'class': 'card-box'
	});
	var card;
	var trs = $('table.full-size tbody tr').each(
		function(index)
		{
			card = getMDLCard($(this), index);			
			div.append(card);
		}
	);
	
	$('table.full-size').after(div);
	
	div.hide();
	
	$('div.card-box div.mdl-tooltip').each(
		function() {
			var id = $(this).attr('for');
			var text = $(this).text();
			var toTheLeft = false;
			//var toTheLeft = !$(this).parent().hasClass('mdl-card__supporting-text');
			$(this).remove();
			ChangeTitleToMDTooltip(id, text, ( toTheLeft ? 'mdl-tooltip--left' : ''));
		}
	);
}

function getMDLCard(tr, index)
{	
	var infoDiv = CreateInfoRow(tr, index);
	var rowDiv = CreateTitleRow(tr, index);
	var phonefirstDiv = CreatePhonefirstRow(tr, index);	
	var phonesecondDiv = CreatePhonesecondRow(tr, index);	
	var phonethirdDiv = CreatePhonethirdRow(tr, index);
	var roomDiv = CreateRoomRow(tr, index);
	var emailLink = CreateEmailRow(tr, index);
	
	var supportingtext = $('<div></div>', {
		'class': 'mdl-card__supporting-text'
	})
	.append(rowDiv)
	.append(infoDiv)	
	.append(phonefirstDiv)
	.append(phonesecondDiv)		
	.append(phonethirdDiv)	
	.append(roomDiv)
	.append(emailLink)
	
	var cardmenu = $('<div class="mdl-card__menu"></div>');
				
	if ($(infoDiv).find('span.hidden-text').length > 0)
	{
		$(infoDiv).find('span.hidden-text').each(
			function()
			{
				var id = 'card-' + $(this).attr('id');
				var tooltip = $(infoDiv).find('div.mdl-tooltip[for=' + $(this).attr('id') + ']').first();
				$(this).attr('id', id);
				tooltip.attr('for', id);	
				tooltip.removeAttr('data-upgraded');	
			}
		);		
	}
	
	var maindiv = $('<div></div>', {
		'class': 'card-square mdl-card mdl-shadow--2dp'
	})
	.css({
		'order': index
	})
	.append(supportingtext, cardmenu);	
	
	return maindiv;	


	function CreateTitleRow(tr, index) 
	{
		var color = tr.children('td.indicator.workstate').children('i').first().css('color').replace('rgb', 'rgba');
		color = color.substr(0, color.length - 1);
		color += ',1)';
		
		var imagediv = $('<div id="person-image' + index + '" class="circular" ></div>')
		.css({
			border: '4px solid ' + color,
			background: color
		});
		
		var datavalue = tr.children('td.indicator.workstate').find('img').attr('src');
		imagediv.attr('datavalue', datavalue);
		
		var h2 = $('<div></div>', {
			'class': 'employee'		
		})
		.css({
			alignSelf: 'flex-start'
		})
		.append(tr.children('td.text.employee').html());	
		
		var workgroup = tr.children('td.text.workgroup').text();
		
		var titleDivSmall = $('<div></div>', {
			'class': 'rowDiv titleDivSmall'
		})
		.append(h2)
		.append(workgroup ? '<span class="workgroup">' + workgroup + '</span>' : '');
		
		var rowDiv = $('<div></div>', {
			'class': 'rowDiv'
		})
		.append(imagediv, titleDivSmall);
		
		return rowDiv;
	}

	function CreateInfoRow(tr, index) 
	{
		var info = tr.children('td.text.info').first().html();
		var infoSpan = $('<span class="info"></span>').append(info);
		var infoIcon = $('<i class="material-icons">info_outline</i>');
		var infoDiv = $('<div></div>', {
			'class': 'rowDiv'
		}).append(infoIcon, infoSpan);
		
		return info.trim() ? infoDiv : '';
	}

	function CreatePhonefirstRow(tr, index) 
	{
		var phonefirst = tr.children('td.text.phone.first').text();
		var phonefirstSpan = $('<span class="phone first"></span>').append(phonefirst);
		var phonefirstIcon = $('<i class="material-icons">phonelink</i>');
		var phonefirstDiv = $('<div></div>', {
			'class': 'rowDiv'
		}).append(phonefirstIcon, phonefirstSpan);

		return phonefirst ? phonefirstDiv : '';
	}

	function CreatePhonesecondRow(tr, index) 
	{
		var phonesecond = tr.children('td.text.phone.second').text();
		var phonesecondSpan = $('<span class="phone second"></span>').append(phonesecond);
		var phonesecondIcon = $('<i class="material-icons">smartphone</i>');
		var phonesecondDiv = $('<div></div>', {
			'class': 'rowDiv'
		}).append(phonesecondIcon, phonesecondSpan);
		
		return phonesecond ? phonesecondDiv : '';
	}

	function CreatePhonethirdRow(tr, index) 
	{
		var phonethird = tr.children('td.text.phone.third').text();
		var phonethirdSpan = $('<span class="phone third"></span>').append(phonethird);
		var phonethirdIcon = $('<i class="material-icons">phone</i>');
		var phonethirdDiv = $('<div></div>', {
			'class': 'rowDiv'
		}).append(phonethirdIcon, phonethirdSpan);
		
		return phonethird ? phonethirdDiv : '';
	}

	function CreateRoomRow(tr, index)
	{
		var room = tr.children('td.text.room').text();
		var roomSpan = $('<span class="room"></span>').append(room);
		var roomIcon = $('<i class="material-icons">room</i>');
		var roomDiv = $('<div></div>', {
			'class': 'rowDiv'
		}).append(roomIcon, roomSpan);
		
		return room ?  roomDiv : '';
	}

	function CreateEmailRow(tr, index) 
	{
		var email = tr.find('td.indicator.mail a img').attr('title');
		var emailSpan = $('<span class="email"></span>').append(email);
		var emailIcon = $('<i class="material-icons">email</i>');
		
		var emailDiv = $('<div></div>', {
			'class': 'rowDiv'
		}).append(emailIcon, emailSpan);
		
		var emailLink = $('<a></a>', {
			href: tr.find('td.indicator.mail a').attr('href')		
		}).append(emailDiv);
		
		return email ?  emailLink : '';
	}

}

// Добавление меню фильтрации для карточек
function AddFilterMenuForCards()
{
	var div = $('<div></div>', {
		'class': 'card-sorting-menu toggle'
	})
	
	$('#toggle-div').after(div);		
	
	CreateCardSearchInput(div);
	CreateHomeButtons(div);
	CreateStateButton(div);
	CreateGroupButton(div);
	CreateRoomButton(div);
	CreateGenderButtons(div);
	//CreateEmailButton(div);
	CreateResetButton(div);
	
	div.hide();	


	function CreateCardSearchInput(parent)
	{
		var input = $("<input>", {
			type: "text",
			"class": "mdl-textfield__input",
			id: "card-searchInput"
		});
		
		var labelForInput = $("<label></label>", {
			"class": "mdl-textfield__label",
			"for": "card-searchInput",
			"style": "line-height: 12pt !important;"
		}).append('Сотрудник');	
		
		var icon = $('<i class="material-icons" style="float: left; margin-top: 22px;">search</i>');
		
		var div = $("<div></div>", {
			"class": "mdl-textfield mdl-js-textfield"
		}).append(input, labelForInput);
		
		var div2 = $("<div class='toggle'></div>").append(icon,div);
		
		parent.append(div2);
		
		componentHandler.upgradeElement(div.get(0));
		
		ChangeTitleToMDTooltip("card-searchInput", 
			"Введите фамилию <br>или имя сотрудника");
	}

	function CreateHomeButtons(parent) 
	{
		
		var homeGroupButton, tooltipHomeGroupButton	
		var homeRoomButton, tooltipHomeRoomButton;
		if (IsMyHomeOffice())
		{
			homeGroupButton = $('<button style="float: left;" id="card-groupSelectButton" class="mdl-button mdl-js-button mdl-button--icon' 
				+'  mdl-button--accent mdl-js-ripple-effect"><i class="material-icons">group</i></button>')
			tooltipHomeGroupButton = $('<div class="mdl-tooltip" for="card-groupSelectButton">Моя группа</div>');	
			
			homeRoomButton = $('<button style="float: left;" id="card-roomSelectButton" class="mdl-button mdl-js-button mdl-button--icon' 
				+'  mdl-button--accent mdl-js-ripple-effect"><i class="material-icons">weekend</i></button>')
			tooltipHomeRoomButton = $('<div class="mdl-tooltip" for="card-roomSelectButton">Моя комната</div>');	
		}
		
		if (homeGroupButton !== undefined && tooltipHomeGroupButton !== undefined && $('div.card-square span.workgroup').length > 0)
		{
			parent.append(homeGroupButton, tooltipHomeGroupButton);
			componentHandler.upgradeElement(homeGroupButton.get(0));
			componentHandler.upgradeElement(tooltipHomeGroupButton.get(0));	
		}	
		
		if (homeRoomButton !== undefined && tooltipHomeRoomButton !== undefined && $('div.card-square span.room').length > 0)
		{
			parent.append(homeRoomButton, tooltipHomeRoomButton);
			componentHandler.upgradeElement(homeRoomButton.get(0));
			componentHandler.upgradeElement(tooltipHomeRoomButton.get(0));	
		}	
	}

	function CreateStateButton(parent)
	{
		var statemenuId = 'workstateMenu';
		
		var stateIcon = $('<i class="material-icons">lens</i>');
		var stateSpan = $('<span id="stateMenuSpan">Статус</span>');
		
		var stateButton = $('<button></button>', {
			id: statemenuId,
			'class': 'mdl-button mdl-js-button',
			datavalue: ''
		}).append(stateIcon)
		.append(stateSpan);
		
		//var stateColors = ['white', '#8bc349', 'rgb(63, 81, 181)', '#ffeb3b', 'gray'];	
		var stateText = ['Статус', 'На работе', 'Работает удаленно', 'Закончил работу', 'Отсутствует'];
		var stateValues = ['', '/Content/ball_green.png', '/Content/ball_blue.png', '/Content/ball_yellow.png', '/Content/ball_gray.png'];
		var li, ic, sp;
		
		var stateUl = $('<ul></ul>', {
			'class': 'mdl-menu mdl-menu--bottom-left mdl-js-menu mdl-js-ripple-effect',
			'for': statemenuId
		});
		
		for(var i = 0; i < stateValues.length; i++) {		
			ic = $('<i class="material-icons">lens</i>');
			sp = $('<span class="stateTextSpan">' + stateText[i] + '</span>')
			
			li = $('<li></li>', {
				'class': 'mdl-menu__item selectLi',
				datavalue: stateValues[i],
			})
			.append(ic)
			.append(sp);
			
			stateUl.append(li);
		}
		
		var stateSelect = $('<div class="card-stateSelect"></div>')
		.append(stateButton, stateUl);
		
		parent.append(stateSelect);
		componentHandler.upgradeElement(stateButton.get(0));
		componentHandler.upgradeElement(stateUl.get(0));
		componentHandler.upgradeElement(stateSelect.get(0));
	}

	function CreateGroupButton(parent) 
	{
		var groupmenuId = 'groupMenu';
		
		var groupSpan = $('<span id="groupMenuSpan">Группа</span>');
		
		var groupButton = $('<button></button>', {
			id: groupmenuId,
			'class': 'mdl-button mdl-js-button',
		})
		.append(groupSpan);
		
		var arrayOfGroupNames = GetGroupNames();
		var groupText = ['Группа'].concat(arrayOfGroupNames);
		var groupValues = [''].concat(arrayOfGroupNames);
		
		
		var groupUl = $('<ul></ul>', {
			'class': 'mdl-menu mdl-menu--bottom-left mdl-js-menu mdl-js-ripple-effect',
			'for': groupmenuId
		});
		
		var shouldGroupBeAdded = false;
		var li;
		
		for(var i = 0; i < groupValues.length; i++) {		
			li = $('<li></li>', {
				'class': 'mdl-menu__item selectLi',
				datavalue: groupText[i] ? groupValues[i] : "NoGroup",
			})
			.append(groupText[i] ? groupText[i] : "---");
			
			if (groupValues[i]) {
				shouldGroupBeAdded = true;
			}
			
			groupUl.append(li);
		}
		
		var groupSelect = $('<div class="card-groupSelect"></div>')
		.append(groupButton, groupUl);
		
		if (shouldGroupBeAdded) {
			parent.append(groupSelect);
			componentHandler.upgradeElement(groupButton.get(0));
			componentHandler.upgradeElement(groupUl.get(0));
			componentHandler.upgradeElement(groupSelect.get(0));
		}
	}

	function CreateRoomButton(parent) 
	{
		var roommenuId = 'roomMenu';
		
		var roomSpan = $('<span id="roomMenuSpan">Комната</span>');
		
		var roomButton = $('<button></button>', {
			id: roommenuId,
			'class': 'mdl-button mdl-js-button',
		})
		.append(roomSpan);
		
		var arrayOfRoomNumbers = GetRoomNumbers();
		var roomText = ['Комната'].concat(arrayOfRoomNumbers);
		var roomValues = [''].concat(arrayOfRoomNumbers);
		
		
		var roomUl = $('<ul></ul>', {
			'class': 'mdl-menu mdl-menu--bottom-left mdl-js-menu mdl-js-ripple-effect',
			'for': roommenuId
		});
		
		var shouldRoomBeAdded = false;
		
		for(var i = 0; i < roomValues.length; i++) {
			li = $('<li></li>', {
				'class': 'mdl-menu__item selectLi',
				datavalue: roomText[i] ? roomValues[i] : "NoRoom",
			})
			.append(roomText[i] ? roomText[i] : "---");
			
			if (roomValues[i]) {
				shouldRoomBeAdded = true;
			}
			
			roomUl.append(li);
		}
		
		var roomSelect = $('<div class="card-roomSelect"></div>')
		.append(roomButton, roomUl);
		
		if (shouldRoomBeAdded) {
			parent.append(roomSelect);
			componentHandler.upgradeElement(roomButton.get(0));
			componentHandler.upgradeElement(roomUl.get(0));
			componentHandler.upgradeElement(roomSelect.get(0));
		}
	}

	function CreateGenderButtons(parent) 
	{
		var iconAll = $('<i class="material-icons">wc</i>');	
		var buttonAll = $('<button></button>', {
			"id": "card-allpeople",
			"class": "checked mdl-button mdl-js-button mdl-button--icon mdl-button--accent mdl-js-ripple-effect",
			type: "button"
		})
		/*
		.css({
			color: 'rgb(250, 250, 250)',
			backgroundColor: 'rgb(66, 66, 66)'
		})*/
		.append(iconAll);	
		
		var tooltipButtonAll = $('<div class="mdl-tooltip" for="card-allpeople">Все сотрудники</div>');
		
		var badgeAll = $('<span id="badgeAll" class="genderMenu mdl-badge mdl-badge--no-background mdl-badge--overlap" data-badge="0"></span>').append(buttonAll, tooltipButtonAll);
		
		//var iconMan = $('<i class="material-icons">fitness_center</i>');	
		var iconMan = '♂';	
		var buttonMan = $('<button></button>', {
			"id": "card-man",
			"class": "mdl-button mdl-js-button mdl-button--icon mdl-button--accent mdl-js-ripple-effect",
			type: "button"
		})
		/*
		.css({
			color: 'rgb(96, 125, 139)'
		})*/
		.append(iconMan);	
		
		var tooltipButtonMan = $('<div class="mdl-tooltip" for="card-man">Мужчины</div>');
		
		var badgeMan = $('<span id="badgeMan" class="genderMenu mdl-badge mdl-badge--no-background mdl-badge--overlap"  data-badge="0"></span>').append(buttonMan, tooltipButtonMan);
		
		//var iconWoman = $('<i class="material-icons">local_florist</i>');	
		var iconWoman = '♀';
		var buttonWoman = $('<button></button>', {
			"id": "card-woman",
			"class": "mdl-button mdl-js-button mdl-button--icon mdl-button--accent mdl-js-ripple-effect",
			type: "button"
		})
		/*
		.css({
			color: 'rgb(255, 171, 64)'
		})*/
		.append(iconWoman);		
		
		var tooltipButtonWoman = $('<div class="mdl-tooltip" for="card-woman">Женщины</div>');
		
		var badgeWoman = $('<span id="badgeWoman" class="genderMenu mdl-badge mdl-badge--no-background mdl-badge--overlap" data-badge="0"></span>').append(buttonWoman, tooltipButtonWoman);
		
		//parent.append(buttonAll, buttonMan, buttonWoman);
		parent.append(badgeAll, badgeMan, badgeWoman);
		
		componentHandler.upgradeElement(buttonAll.get(0));
		componentHandler.upgradeElement(tooltipButtonAll.get(0));
		componentHandler.upgradeElement(buttonMan.get(0));
		componentHandler.upgradeElement(tooltipButtonMan.get(0));
		componentHandler.upgradeElement(buttonWoman.get(0));
		componentHandler.upgradeElement(tooltipButtonWoman.get(0));
	}

	function CreateResetButton(parent) 
	{
		
		var resetIcon = $('<i class="material-icons">clear</i>');
		var resetButton = $('<button></button>', {
			"id": "card-idReset",
			"class": "mdl-button mdl-js-button  mdl-button--fab mdl-button--icon mdl-button--accent  mdl-js-ripple-effect",
			type: "button"
		}).append(resetIcon);	
		
		var tooltipResetButton = $('<div class="mdl-tooltip" for="card-idReset">Сбросить<br>фильтры</div>');
		
		parent.append(resetButton, tooltipResetButton)
		componentHandler.upgradeElement(resetButton.get(0));
		componentHandler.upgradeElement(tooltipResetButton.get(0));
		
		resetButton.hide();	
	}

}

function CreateEmailButton(parent) 
{	
	var emailIcon = $('<i class="material-icons">email</i>');
	var emailButton = $('<button></button>', {
		"id": "card-email",
		"class": "mdl-button mdl-js-button mdl-button--icon mdl-button--accent mdl-js-ripple-effect",
		type: "button"
	}).append(emailIcon);	
	
	var href = 'mailto:'
	
	$('div.card-square').each(
		function() {
			var self = $(this);
			href += self.find('span.email').text() + ';';
		}
	);
	
	
	var emailLink = $('<a></a>', {
		href: href
	})
	.css({
		marginLeft: '8px'
	})
	.append(emailButton);	
	
	var tooltipEmailButton = $('<div class="mdl-tooltip" for="card-email">Отправить письмо <br>выбранным людям</div>');
	
	parent.append(emailLink, tooltipEmailButton)
	componentHandler.upgradeElement(emailButton.get(0));
	componentHandler.upgradeElement(tooltipEmailButton.get(0));
}


function FilterPeople(inputText)
{
	var cells = 'td.employee';
	var cellsThatContainInputText = cells + ':contains("' + inputText + '")';
	$(cellsThatContainInputText).parent().show();				
	$(cells).not(cellsThatContainInputText).parent().hide();
	
	$("th.workstate i")
	.css("color", "white")
	.css("textShadow", "-1px 0 gray, 0 1px gray, 1px 0 gray, 0 -1px gray");	
	
	var cardcells = 'div.card-square > div.mdl-card__supporting-text > div.rowDiv > div.rowDiv.titleDivSmall > div.employee';
	var cardcellsThatContainInputText = cardcells + ':contains("' + inputText + '")';
	$(cardcellsThatContainInputText).parent().parent().parent().parent().show();	
	$(cardcells).not(cardcellsThatContainInputText).parent().parent().parent().parent().hide();
}

function SetProfileImages() 
{
	ClearLocalStorage();
	
	$('div.card-square').each(
		function() {
			var self = $(this);
			var item = self.children('div.mdl-card__supporting-text').first()
						.children('div.rowDiv').first()
						.children('div.circular').first();
			
			var email = self.find('span.email').first().text();
			
			var src, gender;
			
			if (email)
			{				
				if (localStorage[email])
				{
					src = localStorage[email];				
					
					var request;
					if(window.XMLHttpRequest) {
						request = new XMLHttpRequest();
					}
					else {
						request = new ActiveXObject("Microsoft.XMLHTTP");
					}
					request.open('GET', src, true);
					request.onreadystatechange = function() {
						if (request.readyState === 4){
							if (request.status === 404) {  
								localStorage.removeItem(email);
							}  else {
								SetIndividualProfileImage(item, src);
							}
						} 
					};	
					try {
						request.send(); 	
					} catch (e) {}
				}
				else {
					$.get("http://confirmitconnect.firmglobal.com/Search/Pages/PeopleResults.aspx?k=" + email, {}, function(data, status, xhr) {
						var updatedData = FixDownloadedDataForProfileImages(data);
						var temp = $("<div></div>");
						temp.html(updatedData);
						
						src = temp.find('#CSR_IMG_1').attr('src');
							
						if (src) 
						{
							localStorage[email] = src;
							SetIndividualProfileImage(item, src);
						}
					});
				}
			}
		}
	);		
}



function ClearLocalStorage() {
	/*var today = new Date();		
	var day = today.getDate();
	
	if (day % 7 == 0 && !localStorage['isCleared'])
	{
		localStorage.clear();
		localStorage['isCleared'] = true;		
	}
	else
	{
		localStorage['isCleared'] = false;
	}*/
}

function SetAllPeopleGender() {
	ClearLocalStorage();
	
	$('div.card-square').each(
		function(index) {
			var self = $(this);
			var employee = self.find('.employee').first().text();
			
			var email = self.find('span.email').first().text();
			
			var gender;
			
			if (employee) {
				if (localStorage[employee])
				{
					gender = localStorage[employee];
					
					if (gender) 
					{
						SetGender(self, gender);
					}					
				} else {				
					$.get("http://morpher.ru/Demo.aspx?s=" + employee, {}, function(data, status, xhr) {
						var updatedData = FixDownloadedDataForGender(data);
						var temp = $("<div></div>");
						temp.html(updatedData);
								
						gender = temp.find('#ctl00_ctl00_BodyPlaceHolder_ContentPlaceHolder1_РодЧислоLabel').text();
							
						if (gender) 
						{
							localStorage[employee] = gender;
							SetGender(self, gender);
						}
					});
				}
			}
		}
	);	
}

function SetRussianEquivalentForEnglishNames(office) {
	ClearLocalStorage();
	
	$('div.card-square').each(
		function(index) {
			var self = $(this);
			var employee = self.find('.employee').first().text();
			
			var email = self.find('span.email').first().text();
			
			var nameIndex = email.indexOf('@');			
			var englishName = email.substr(0, nameIndex);
			
			if (englishName) {
				localStorage[englishName] = employee;
				localStorage[office] = true;
			}
		}
	);	
}

function SetGenderForEnglishLanguage() {
	ClearLocalStorage();
	
	$('div.card-square').each(
		function(index) {
			var self = $(this);
			
			var email = self.find('span.email').first().text();
			var nameIndex = email.indexOf('@');			
			var englishName = email.substr(0, nameIndex);
			
			var employee, gender;
			
			if (englishName) {
				if (localStorage[englishName])
				{
					employee = localStorage[englishName];
					gender = localStorage[employee];
					
					if (gender) 
					{
						SetGender(self, gender);
					}					
				} 
			}
		}
	);
}


/*
http://morpher.ru/Demo.aspx?s=%D0%9A%D0%BE%D0%B2%D0%B0%D0%BB%D1%8C%D1%87%D1%83%D0%BA%20%D0%92%D0%B8%D0%BA%D1%82%D0%BE%D1%80%D0%B8%D1%8F
*/

function SetIndividualProfileImage(item, src) {
	item.css({
		background: 'url("' + src + '") no-repeat',
		backgroundSize: 'cover'
	});
}

function SetGender(card, gender) {
	
		/* ♀ &#9792; woman */
		/* ♂ &#9794; man */
		
		
	var number = +$('#badgeAll').attr('data-badge');
	$('#badgeAll').attr('data-badge', +number + 1);	
	
	
	var image = card.find('.circular').first();
	var imageParent = image.parent();	
	
	if (gender.toLowerCase().indexOf('мужской') >= 0) {
		//card.find('.rowDiv .titleDivSmall').first().append('<i class="material-icons man">fitness_center</i>');
		//card.find('.mdl-card__menu').first().append('<i class="material-icons man">fitness_center</i>');
		
		var badgeMan = $('<span class="man mdl-badge mdl-badge--overlap" data-badge="♂"></span>')
		.append(image);
		
		imageParent.prepend(badgeMan);	

		badgeMan.parent().css('paddingTop','8px');
		
		var number1 = +$('#badgeMan').attr('data-badge');
		$('#badgeMan').attr('data-badge', +number1 + 1);		
	} 
	if (gender.toLowerCase().indexOf('женский') >= 0) {
		//card.find('.rowDiv .titleDivSmall').first().append('<i class="material-icons woman">local_florist</i>');
		//card.find('.mdl-card__menu').first().append('<i class="material-icons woman">local_florist</i>');
		
		var badgeWoman = $('<span class="woman mdl-badge mdl-badge--overlap" data-badge="♀"></span>')
		.append(image);
		
		imageParent.prepend(badgeWoman);	
	
		badgeWoman.parent().css('paddingTop','8px');		
		
		var number2 = +$('#badgeWoman').attr('data-badge');
		$('#badgeWoman').attr('data-badge', +number2 + 1);		
	}
}

function FixDownloadedDataForProfileImages(data) {
	return data.replace(/\/(_layouts|Style)+/g, "http://confirmitconnect.firmglobal.com/$1").replace('IMNRC', 'String.prototype.toLowerCase');
}

function FixDownloadedDataForGender(data) {
	return data.replace(/(\/WebResource|images|orphus|logo)+/g, "http://morpher.ru/$1").replace('IMNRC', 'String.prototype.toLowerCase');
}

function SetEmailButtonLink() {
	$('button#card-email').parent().attr('href', CreateEmailLink());
}

function CreateEmailLink() {
	var href = 'mailto:';
	
	if ($('table.full-size:visible').length > 0) {
		$('table.full-size tbody tr:visible').each(
			function() {
				var self = $(this);
				href += self.find('td.indicator.mail a').attr('href').replace('mailto:', '') + ';';
			}
		);
	} else {	
		$('div.card-square:visible').each(
			function() {
				var self = $(this);
				href += self.find('span.email').text() + ';';
			}
		);
	}
	
	return href;
}



$(document).ready(
	function() {
		CreateSearchInput_withMD();	
		SetClassesOnColumns();		
		
		CreateSelectForGroups();		
		CreateSelectOnWorkState();
		CreateSelectOnRoom();
		CreateSelectOnGender();
		
		PrepareEmployeeColumnForSort();
		PrepareWorkgroupColumnForSort();		
		PrepareRoomColumnForSort();
		
		
		RemoveEmptyColumns();
		AddResetFiltersButton();
		CreateSettingsForLangAndDisplay();
		CreateMDLCard();	
		
		AddBorderToStatusSelect();
		AddTooltips_officeScript();
		
		$("button")
		.not("#idReset")
		.not(".mdl-button--icon")
		.not("form[action='/Remote/Come'] button, form[action='/Remote/Leave'] button")
		.each(
			function(index) {
				ChangeButtonsToMD.apply(this);				
			}
		);
		$("table.full-size").before($("div.holiday-box"));
		
		ShowTableFullSizeAndHolidayBox();
		ResizeTableHeader();
		SetTableHeightForOffice();	
		
		CreateEmailButton($('main span.mdl-layout-title'));
		AddToggleButtonTableAndCards();
		SetWorkerCards();
		AddFilterMenuForCards();		
		
		SetProfileImages();
		SetAllPeopleGender();
		SetEmailButtonLink();
		
		
		
		/******************************
			Search inputs
		******************************/
		
		$( "#searchInput" ).on("input", 
			function() {
				$("#workgroupSelect, #workStateSelect, #roomSelect, #genderSelect").val("");
				$('#workstateMenu').attr('datavalue', '')
				$('#stateMenuSpan').text('Статус')
				$('#groupMenuSpan').text('Группа');
				$('#roomMenuSpan').text('Комната');
				$('#card-man, #card-woman').removeClass('checked');			
				$('#card-allpeople').addClass('checked');
				
				var inputText = escapeHtml($(this).val());
				$('#card-searchInput').val(inputText);									
				
				FilterPeople(inputText);
				
				if (inputText != '')
				{
					$(this).parent().addClass('is-dirty');
					$('#card-searchInput').parent().addClass('is-dirty');
				}
				else
				{
					$(this).parent().removeClass('is-dirty');
					$('#card-searchInput').parent().removeClass('is-dirty');
				}
				
				ResizeTableHeader();
				SetTableHeightForOffice();			
				CheckResetButton();	
				SetEmailButtonLink();
			}
		);		
		
		$("#card-searchInput").on("input", 
			function() {
				$("#workgroupSelect, #workStateSelect, #roomSelect, #genderSelect").val("");
				$('#workstateMenu').attr('datavalue', '')
				$('#stateMenuSpan').text('Статус')
				$('#groupMenuSpan').text('Группа');
				$('#roomMenuSpan').text('Комната');
				var inputText = escapeHtml($(this).val());
				$('#searchInput').val(inputText);
				$('#card-man, #card-woman').removeClass('checked');			
				$('#card-allpeople').addClass('checked');
				
				FilterPeople(inputText);
				
				if (inputText != '')
				{
					$(this).parent().addClass('is-dirty');
					$('#searchInput').parent().addClass('is-dirty');
				}
				else
				{
					$(this).parent().removeClass('is-dirty');
					$('#searchInput').parent().removeClass('is-dirty');
				}
				
				CheckResetButton();		
				SetEmailButtonLink();						
			}
		);
		
		/******************************
			Filters logic
		******************************/
		
		$("#workgroupSelect, #workStateSelect, #roomSelect, #genderSelect").change(
			function () {
				var datavalueGroup = $("select#workgroupSelect option").filter(":selected").text();
				$('#groupMenuSpan').text(datavalueGroup);
				
				var selectedOptionState = $("select#workStateSelect option").filter(":selected");
				var datavalueState = selectedOptionState.val();
				var textState = selectedOptionState.text();
				textState = textState ? textState : 'Статус';
				$('#workstateMenu').attr('datavalue', datavalueState);
				$('#stateMenuSpan').text(textState);
							
				var datavalueRoom = $("select#roomSelect option").filter(":selected").text();
				$('#roomMenuSpan').text(datavalueRoom);
				
				var datavalueGender = $("select#genderSelect option").filter(":selected").val();
				datavalueGender = datavalueGender ? datavalueGender  : 'allpeople';
				$('#card-allpeople, #card-man, #card-woman').removeClass('checked');			
				$('#card-' + datavalueGender).addClass('checked');
				
				SetFilters();
				ResizeTableHeader();
				SetTableHeightForOffice();
				CheckResetButton();
				SetEmailButtonLink();
			}
		);				
		
		$('.card-stateSelect li.selectLi').click(
			function () {
				var datavalue = $(this).attr('datavalue');
				$('#workstateMenu').attr('datavalue', datavalue);
				$('#stateMenuSpan').text($(this).find('.stateTextSpan').text());
				
				$("select#workStateSelect").val(datavalue);
				
				
				SetFilters();
				ResizeTableHeader();
				SetTableHeightForOffice();
				CheckResetButton();	
				SetEmailButtonLink();		
			}
		);
		
		$('.card-groupSelect li.selectLi').click(
			function () {
				var datavalue = $(this).attr('datavalue');
				$('#groupMenuSpan').text($(this).text());
				
				$("select#workgroupSelect").val(datavalue);
				
				SetFilters();
				ResizeTableHeader();
				SetTableHeightForOffice();
				CheckResetButton();	
				SetEmailButtonLink();			
			}
		);
		
		$('.card-roomSelect li.selectLi').click(
			function () {
				var datavalue = $(this).attr('datavalue');
				$('#roomMenuSpan').text($(this).text());				
				
				$("select#roomSelect").val(datavalue);
				
				SetFilters();
				ResizeTableHeader();
				SetTableHeightForOffice();
				CheckResetButton();
				SetEmailButtonLink();		
			}
		);
		
		$('#card-allpeople, #card-man, #card-woman').click(
			function(){
				$('#card-allpeople, #card-man, #card-woman').removeClass('checked');			
				$(this).addClass('checked');
				
				var gender = $(this).attr('id').replace('card-', '').replace('allpeople', '');
				$("select#genderSelect").val(gender);		
			
				SetFilters();
				ResizeTableHeader();
				SetTableHeightForOffice();
				CheckResetButton();				
				SetEmailButtonLink();		
			}
		);
		
		/******************************
			Sorting
		******************************/
		
		$(".arrowDiv").click(		
			function() {
				// determine column for sort
				var classToSort = GetColumnToSort($(this).parent());
				var arrayToSort = $("table.full-size > tbody > tr");
				var cardsToSort = $('.card-square');
				if ($(this).hasClass("headerSortUp"))
				{
					//sortDown					
					arrayToSort = mergeSort(arrayToSort, 
						function (item1, item2)
						{
							if ($(item1).children("td." + classToSort).text().toLowerCase() > $(item2).children("td." + classToSort).text().toLowerCase())
							{
								return -1;
							}
							else 
								if ($(item1).children("td." + classToSort).text().toLowerCase() < $(item2).children("td." + classToSort).text().toLowerCase())
								{
									return 1;								
								}
								else
								{
									return 0;
								}
						}
					);
					
					cardsToSort = mergeSort(cardsToSort, 
						function (item1, item2)
						{
							if ($(item1).find("." + classToSort).text().toLowerCase() > $(item2).find("." + classToSort).text().toLowerCase())
							{
								return -1;
							}
							else 
								if ($(item1).find("." + classToSort).text().toLowerCase() < $(item2).find("." + classToSort).text().toLowerCase())
								{
									return 1;								
								}
								else
								{
									return 0;
								}
						}
					);
					
					$(this).removeClass("headerSortUp").addClass("headerSortDown")
						.css("backgroundImage", "url(" + chrome.extension.getURL("/images/asc.gif") + ")");					
				}
				else
				{
					//sortUp
					arrayToSort = mergeSort(arrayToSort,
						function (item1, item2)
						{
							if ($(item1).children("td." + classToSort).text() > $(item2).children("td." + classToSort).text())
							{
								return 1;
							}
							else 
								if ($(item1).children("td." + classToSort).text() < $(item2).children("td." + classToSort).text())
								{
									return -1;								
								}
								else
								{
									return 0;
								}
						}
					);
					
					cardsToSort = mergeSort(cardsToSort, 
						function (item1, item2)
						{
							if ($(item1).find("." + classToSort).text().toLowerCase() > $(item2).find("." + classToSort).text().toLowerCase())
							{
								return 1;
							}
							else 
								if ($(item1).find("." + classToSort).text().toLowerCase() < $(item2).find("." + classToSort).text().toLowerCase())
								{
									return -1;								
								}
								else
								{
									return 0;
								}
						}
					);
					
					$(this).removeClass("headerSortDown").addClass("headerSortUp")
						.css("backgroundImage", "url(" + chrome.extension.getURL("/images/desc.gif") + ")");
				}
				
				$("table.full-size > tbody").append(arrayToSort);
				
				$(cardsToSort).each(function(index) {
					$(this).css({ 
						'order': index
					});
				});
				
				$('div.card-box').append(cardsToSort);
				
			}
		);
		
		/******************************
			Reset buttons
		******************************/
		
		$("button#idReset").on("click", 
			function() {
				ResetTableParametres();			
				ResizeTableHeader();
				SetTableHeightForOffice();
				SetEmailButtonLink();		
				
				$(this).fadeOut("fast");
				$("button#card-idReset").fadeOut("fast");
			}
		);
		
		$("button#card-idReset").on("click", 
			function() {
				ResetTableParametres();	
				SetEmailButtonLink();			
				
				$(this).fadeOut("fast");
				$("button#idReset").fadeOut("fast");
			}
		);
		
		/******************************
			Home buttons
		******************************/
		
		$("#roomSelectButton").click(
			function() {
				ResetTableParametres();
				SelectHomeRoom();
				ResizeTableHeader();
				SetTableHeightForOffice();
				CheckResetButton();
				SetEmailButtonLink();		
			}
		);
		
		$("#groupSelectButton").click(
			function() {
				ResetTableParametres();
				SelectHomeGroup();
				ResizeTableHeader();
				SetTableHeightForOffice();
				CheckResetButton();
				SetEmailButtonLink();		
			}
		);		
		
		$('#card-roomSelectButton').click(
			function() {
				ResetTableParametres();
				SelectHomeRoom();
				CheckResetButton();
				SetEmailButtonLink();		
			}
		);
		
		$('#card-groupSelectButton').click(
			function() {
				ResetTableParametres();
				SelectHomeGroup();
				CheckResetButton();
				SetEmailButtonLink();		
			}
		);
		
		/******************************
			Mode toggling
		******************************/
		
		$('#table-button').click(
			function() {
				var className = 'mdl-button--fab';
				if ($(this).hasClass(className))
					return;
				$(this).addClass(className);
				$('#card-button').removeClass(className);
				$('table.full-size').show();
				$('div.card-box').hide();
				$('div.card-sorting-menu').hide();
				
				ResizeTableHeader();
				SetTableHeightForOffice();
			}
		);
		
		$('#card-button').click(
			function() {
				var className = 'mdl-button--fab';
				if ($(this).hasClass(className))
					return;
				$(this).addClass(className);
				$('#table-button').removeClass(className);
				$('div.card-box').show();
				$('div.card-sorting-menu').show();
				$('table.full-size').hide();
			}
		);
		
		/******************************
			Adjust the width of thead 
			cells when window resizes
		******************************/

		$(window).resize(
			function() {
				ResizeTableHeader();
				SetTableHeightForOffice();
			}
		).resize(); /* Trigger resize handler */
	}		
);