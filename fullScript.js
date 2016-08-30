$(document).hide();

// OVERWRITES old selecor
jQuery.expr[':'].contains = function(a, i, m) {
  return jQuery(a).text().toUpperCase()
      .indexOf(m[3].toUpperCase()) >= 0;
};

String.prototype.replaceAll = function(search, replace){
  return this.split(search).join(replace);
}

function ShowTableFullSizeAndHolidayBox()
{
	$("table.full-size, div.holiday-box").fadeIn("fast");
}

function SetTimeToLocalStorage()
{
	var temp = $("<div></div>");
	temp.load("http://co-msk-app02/Personal tr.summary",
		function ()
		{
			localStorage["current_time"] = $(this)
				.children(".summary:contains('Итог')")
				.not(":contains('за месяц')")
				.last().children("td.time").eq(2).text();
			if ($(this)
				.children(".summary:contains('Итог')")
				.not(":contains('за месяц')")
				.last().children("td.time").eq(2).hasClass("negative")
				)
			{
				localStorage["current_class"] =  "accentColor";
				localStorage["removed_class"] = "greenColor";
			}
			else
			{
				localStorage["current_class"] =  "greenColor";
				localStorage["removed_class"] = "accentColor";
			}			
		}
	);
	
}

function PutInfoToTheLeftPanel()
{
	var clearfix1 = $("<div></div>",
	{
		"class": "clearfix"		
	}).css(
	{
		"height": "40px"
	});
	
	var clearfix2 = $("<div></div>",
	{
		"class": "clearfix"		
	}).css(
	{
		"height": "40px"
	});
	
	$("form[action='/Remote/Come']").before($("div.status-right"), 
	clearfix1,
	$("div.status-left"),
	clearfix2);	
	
	var newText = ChangeNumberOfMonthToWord($("div.status-left").text());
	$("div.status-left").empty().append(newText);
}

function ChangeNumberOfMonthToWord(textOfStatusLeftBlock)
{
	var temp = textOfStatusLeftBlock;
	
	var fisrtChar = temp.substr(0,1);
	
	switch(fisrtChar)
	{
		case "п":
			temp = "П" + temp.substr(1);
			break;
		case "в":
			temp = "В" + temp.substr(1);
			break;
		case "с":
			temp = "С" + temp.substr(1);
			break;
		case "ч":
			temp = "Ч" + temp.substr(1);
			break;
	}
	
	temp = temp.replace(".01.", " Января ");	
	temp = temp.replace(".02.", " Февраля ");
	temp = temp.replace(".03.", " Марта ");
	temp = temp.replace(".04.", " Апреля ");
	temp = temp.replace(".05.", " Мая ");
	temp = temp.replace(".06.", " Июня ");
	temp = temp.replace(".07.", " Июля ");
	temp = temp.replace(".08.", " Августа ");
	temp = temp.replace(".09.", " Сентября ");
	temp = temp.replace(".10.", " Октября ");
	temp = temp.replace(".11.", " Ноября ");
	temp = temp.replace(".12.", " Декабря ");
	
	var position = temp.indexOf(",");
	return temp.substr(0, position) + "<br>" + temp.substr(position + 2);
}

function CreateMenu()
{
	var newMenu = $("<ul></ul>",
	{
		"id": "menu", 		
		"class": "nav"
	})
	.append($(".navbar ul").first().children("li"));
	
	var clearfix = $("<div></div>",
	{
		"class": "clearfix"		
	})
	.css(
	{
		height: "55px"
	});
	
	
	$(".status-bar").append(newMenu);
	$(".status-bar").after(clearfix);
	
	$("#menu").children().each( 
		function(index)
		{
			$(this).attr("id", "menu_li" + index).addClass("drop");	
			$(this).children("a").text($(this).children("a").text().toUpperCase());
		}
	);	
	
	$("#menu_li0").append($("<ul id='menu_li0_submenu'><ul>"));
	$("#menu_li0_submenu").load("/ ul.nav2 li", 
		function()
		{
			$("#menu_li0_submenu li").first().children("a").attr("href", "http://co-msk-app02/?officeid=1");
			$("#menu_li0_submenu li").last().children("a").attr("href", "http://co-msk-app02/?officeid=2")
			$("#menu_li0_submenu a").each(
				function()
				{
					$(this).text($(this).text().toUpperCase());
				}
			);			
		}
	);
	
	$("#menu_li1").append($("<ul id='menu_li1_submenu'><ul>"));
	$("#menu_li1_submenu").load("/Personal ul.nav2 li",
		function()
		{
			$("#menu_li1_submenu li").last().children("a").attr("href", "http://co-msk-app02/Personal");
			$("#menu_li1_submenu a").each(
				function()
				{
					$(this).text($(this).text().toUpperCase());
				}
			);	
			
		}
	);	
	
	$("#menu_li2").append($("<ul id='menu_li2_submenu'><ul>"));
	$("#menu_li2_submenu").load("/Notes ul.nav2 li",
		function()
		{
			$("#menu_li2_submenu li").last().children("a").attr("href", "http://co-msk-app02/Notes");
			$("#menu_li2_submenu a").each(
				function()
				{
					$(this).text($(this).text().toUpperCase());
				}
			);	
			
		}
	);	
	
	$("#menu_li3").append($("<ul id='menu_li3_submenu'><ul>"));
	$("#menu_li3_submenu").load("/Calendar ul.nav2 li",
		function()
		{
			$("#menu_li3_submenu li").eq(1).children("a").attr("href", "http://co-msk-app02/Calendar");
			$("#menu_li3_submenu a").each(
				function()
				{
					$(this).text($(this).text().toUpperCase());
				}
			);	
			
		}
	);
}

function ChangeButtonsToMD()
{
	$(this).addClass("mdl-button mdl-button--raised mdl-js-button mdl-button--accent mdl-js-ripple-effect");
	componentHandler.upgradeElement($(this).get(0));	
}

function ChangeTextInputToMD(index)
{	

	var nodes = [], values = [];
	for (var att, i = 0, atts = $(this).get(0).attributes, n = atts.length; i < n; i++) {
		att = atts[i];
		nodes.push(att.nodeName);
		values.push(att.nodeValue);
	}
	
	var input = $('<input></input>');
	for (i = 0; i < nodes.length; i++)
	{
		input.attr(nodes[i], values[i]);
	}

	input.addClass("mdl-textfield__input")
	.css("fontSize", "11pt");
	
	var id;
	if (input.attr("id"))
	{
		id = input.attr("id");
	}
	else
	{
		id = input.attr("name") + "_" + index;
		input.attr("id", id);		
	}	

	var labelForInput = $("<label></label>", {
		"class": "mdl-textfield__label",
		"for": id
	}).append(input.attr("placeholder"));	
	
	input.attr("placeholder", "");
	
	var div = $("<div></div>", {
		"class": "mdl-textfield mdl-js-textfield"
	});
	
	$(this).after(div);
	div.append(input, labelForInput);
	$(this).remove();
	
	componentHandler.upgradeElement(div.get(0));
}

function ReplaceInput()
{
	var button = $("<button></button>",
	{
		type: $(this).attr("type"),
		"class": "inputReplaceButton " + $(this).attr("class")
	}).append($(this).attr("value"));
	
	if($(this).attr("type") == "button")
	{
		button.attr("onclick", $(this).attr("onclick"));
	}
	
	$(this).after(button);
	$(this).hide();
}

function CreateFixedHeader()
{
	$(".status-bar").hide();
	$(".navbar").hide();

	var title = $('<div class="mdl-layout__header-row" style="flex-wrap: wrap;"><!-- Title -->'
		+ '<span class="mdl-layout-title notfixed" style="padding-right: 146px; padding-top: 33px; line-height: 30px;">' 
		+ $(".status-left").html() 
		+ '</span>'	
		+ '<span class="mdl-layout-title notfixed" style="padding-right: 200px; padding-top: 0px;"></span>' 
		+ '<span class="mdl-layout-title" style="position: absolute; right: 10px; top: 15px;">' 
		+ $(".status-right").text() + '</span>'
		+ '</div>');
	componentHandler.upgradeElement(title.get(0));
	
	var header = $('<header></header>', {
		"class": "mdl-layout__header"
	}).append(title, $("#menu"));
	componentHandler.upgradeElement(header.get(0));
	
	var drawer = $('<div class="mdl-layout__drawer"></div>')
	.append($(".navbar form"));
	componentHandler.upgradeElement(drawer.get(0));
	
	var mainContent = $('<main class="mdl-layout__content content-wide"></main>')
	.append($(".main"));
	
	componentHandler.upgradeElement(mainContent.get(0));
	
	var div = $("<div></div>", {
		"class": "mainMenu mdl-layout mdl-js-layout mdl-layout--fixed-header mdl-layout--fixed-drawer"
	}).append(header, drawer, mainContent);

	$(".navbar").before(div);
	
	$(".mdl-layout-title").eq(2).prepend($(".status-right img"));	
	 
	$(".mdl-layout-title").eq(1).append("Текущее время: ", 
		'<span class="mdl-layout-title currentTime" style="display: inline">' 
		+ '</span>');
	if (localStorage["current_time"] !== undefined)
	{
		$("span.currentTime").text(localStorage["current_time"]);
	}
	if (localStorage["current_class"] !== undefined && localStorage["removed_class"] !== undefined)
	{
		$("span.currentTime")
		.removeClass(localStorage["removed_class"])
		.addClass(localStorage["current_class"]);
	}
	
	// screenOn: show Body
	$(document.body).show();
	
	var temp = $("<div></div>");
	temp.load("http://co-msk-app02/Personal tr.summary",
		function ()
		{
			var time = $(this)
				.children(".summary:contains('Итог')")
				.not(":contains('за месяц')")
				.last()
				.children("td.time").eq(2).text();
				
			localStorage["current_time"] = time;
			$("span.currentTime").text(time);
			if ($(this)
				.children(".summary:contains('Итог')")
				.not(":contains('за месяц')")
				.last()
				.children("td.time")
				.eq(2)
				.hasClass("negative")
			)
			{
				localStorage["current_class"] = "accentColor";
				localStorage["removed_class"] = "greenColor";
				$("span.currentTime").removeClass("greenColor").addClass("accentColor");
			}
			else
			{
				localStorage["current_class"] = "greenColor";
				localStorage["removed_class"] = "accentColor";
				$("span.currentTime").removeClass("accentColor").addClass("greenColor");
			}
		}
	);
	
}

function ChangePicturesToMDLIcons()
{
	$("img").each(
		function(index)
		{
			var iconType, color;
			switch($(this).attr("src"))
			{
				case "/Content/mail.png":
					iconType = "email";
					color = "gray";
					break;
				case "/Content/ball_gray.png":
					color = "gray";
					iconType = "lens";
					break;
				case "/Content/ball_green.png":
					color = "#8bc349";
					iconType = "lens";
					break;
				case "/Content/ball_blue.png":
					color = "rgb(63, 81, 181)";
					iconType = "lens";
					break;
				case "/Content/ball_yellow.png":
					color = "#ffeb3b";
					iconType = "lens";
					break;
			}
			var icon = $('<i class="material-icons" style="display: block; color:' + color + ';">' + iconType + '</i>');
			icon.attr("title", $(this).attr("title"));
			$(this).after(icon);
			$(this).hide();
		}
	)
	
	$("span.mdl-layout-title i").css(
	{
		"float": "left",
		"fontSize": "20px"
	});
	
	$("table.full-size i").first()
	.css(
	{
		"float": "left",
		"marginTop": "3px",
		"color": "white",
		"textShadow": "-1px 0 gray, 0 1px gray, 1px 0 gray, 0 -1px gray",
		"cursor": "default"
	});
}

function CreateCommonMDLCard()
{
	if (window.location.pathname == "/")
		return;

	$(".status-center").hide();
	$(".main").hide();
	
	var header = $('<span></span>',
	{
		"class": "mdl-layout-title"
	})
	.append($(".status-center").text());
	
	$("table.full-size")
	.addClass("mdl-shadow--2dp");	
	$(".mdl-layout__content").append(header, $("table.full-size"));
	if (window.location.pathname == "/Notes")
	{
		if ($("form[action='/Notes']").length > 0)
		{
			CreateCardForNotesSaving();
		}		
	}
}

function CreateCardForNotesSaving()
{	
	var div = $('<div></div>', {
		"class": "noteSaveAndCancelCard mdl-card mdl-shadow--2dp"
	}).append($("form[action='/Notes']"));
	$(".mdl-layout__content").append(div);
}

function SetAllButtonsAndInputsToMDL()
{
	$("input[type=submit], input[type=button]").each(
		function(index)
		{	
			ReplaceInput.apply(this);				
		}
	);
		
	$("button").each(
		function(index)
		{	
			ChangeButtonsToMD.apply(this);				
		}
	);
		
	$('input[type=text]').not("#idReset").each(
		function(index)
		{
			ChangeTextInputToMD.apply(this, [index]);
		}
	);
		
	$('form.nav2 input[type=text]')
	.parent()
	.css("width", "148px")
	.before($('<i class="material-icons" style="float: left; margin-top:22px;">search</i>'));
		
	if (window.location.pathname == "/Notes")
	{
		$("label[for=Comment]").text("Текст заметки");
	}
			
	SetRaisedForOnlyOneButton();
	PutButtonsToTheOtherLineInNotes();
}


function SetRaisedForOnlyOneButton()
{
	var colorOfStatus = $("div.status-right > img").attr("src");
	colorOfStatus = colorOfStatus.replace("/Content/ball_", "");
	colorOfStatus = colorOfStatus.replace(".png", "");
	switch(colorOfStatus)
	{
		case "blue":
		case "green":
			$("form[action='/Remote/Come']").children("button")
				.removeClass("mdl-button--raised");
			componentHandler.upgradeElement($("form[action='/Remote/Come']").children("button").get(0));			
			$("form[action='/Remote/Leave']").show();
			break;
		case "yellow":
		case "gray":		
			$("form[action='/Remote/Come']").show();
			$("form[action='/Remote/Leave']").children("button")
				.removeClass("mdl-button--raised");
			componentHandler.upgradeElement($("form[action='/Remote/Leave']").children("button").get(0));
			break;
	}
}

function PutButtonsToTheOtherLineInNotes()
{
	$("input#Comment").parent().after("<br><br>");
}

function RestyleTableForCalendar()
{
	$("table.full-size").addClass("mdl-shadow--2dp");
	componentHandler.upgradeElement($(".full-size").get(0));
}

function AddButtonToStopBlinking()
{
	$("body").append("<button class='blink mdl-button' style='z-index: -10;'></button>");
}

function SetUpCalendarTable()
{
	$("table.full-size tr").each(
		function()
		{
			var current = $(this).children("td").first().text();
			
			current = current
			.replaceAll("Пн", "Понедельник,")
			.replaceAll("Вт", "Вторник,")
			.replaceAll("Ср", "Среда,")
			.replaceAll("Чт", "Четверг,")
			.replaceAll("Пт", "Пятница,")
			.replaceAll("Сб", "Суббота,")
			.replaceAll("Вс", "Воскресенье,")
			.replaceAll(".01", " Января")
			.replaceAll(".02", " Февраля")
			.replaceAll(".03", " Марта")
			.replaceAll(".04", " Апреля")
			.replaceAll(".05", " Мая")
			.replaceAll(".06", " Июня")
			.replaceAll(".07", " Июля")
			.replaceAll(".08", " Августа")
			.replaceAll(".09", " Сентября")
			.replaceAll(".10", " Октября")
			.replaceAll(".11", " Ноября")
			.replaceAll(".12", " Декабря");
			
			$(this).children("td").first().text(current);
		}
	)
}

function AddDatePickerToNotes()
{
	$("#NoteDate").datepicker({
		dateFormat: 'dd.mm.yy',
		onClose: function()
		{
			if ($("#NoteDate").val() != "")
			{
					$(this).parent().addClass("is-dirty");
			}
			else
			{
				$(this).parent().removeClass("is-dirty");
			}
		}
	});	
}

function ChangeTitleToMDTooltip(id, title, className)
{
	var tooltip = $('<div class="mdl-tooltip ' + (className ? className : "") + '" for="' 
		+ id 
		+ '">'
		+ title
		+'</div>');
	
	$("#" + id).after(tooltip);
	//componentHandler.upgradeElement($("#" + id).get(0));
	componentHandler.upgradeElement(tooltip.get(0));	
	
}

function AddTooltips_fullScrip()
{
	$("input[type=text]").each(
		function(index)
		{			
			if ($(this).attr("title") === undefined)
			{
				return true;
			}
			ChangeTitleToMDTooltip($(this).attr("id"), $(this).attr("title"));
			$(this).removeAttr("title");
		}
	);
	
	$("li.drop").removeAttr("title");
}


$(document).ready
( 
	function() 
	{
		if (window.location.pathname == "/" || window.location.pathname == "/Personal")
		{			
			$("table.full-size, div.holiday-box").hide();
		}	
		
		if (window.location.pathname == "/Notes")
		{			
			$('#NoteDate').removeAttr("autofocus");
		}
		
		SetTimeToLocalStorage();
		PutInfoToTheLeftPanel();
		CreateMenu();
		$("ul.nav2").hide();
		$("div.version").hide();	
		$(".status-bar").height("100px");
		
		SetAllButtonsAndInputsToMDL();		
		CreateFixedHeader();	
		
		ChangePicturesToMDLIcons();
		CreateCommonMDLCard();
		
		RestyleTableForCalendar();
		
		AddButtonToStopBlinking();
		AddDatePickerToNotes();
		
		AddTooltips_fullScrip();
		
		if (window.location.pathname == "/Calendar")
		{			
			SetUpCalendarTable();
		}		
		
		$("div.status-right a, th.indicator a").click(
			function()
			{				
				return false;	
			}
		)		
		
		$(window).resize(
			function()
			{
				if ($(this).width() < 830)
				{
					$("div.mainMenu").addClass("is-small-header");
				}
				else
				{
					$("div.mainMenu").removeClass("is-small-header");
				}
			}
		).resize();
		
	}		
);