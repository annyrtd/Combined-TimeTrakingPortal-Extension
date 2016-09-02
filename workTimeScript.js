var isMonth = true;
var isStudent = false;
var orderOfDays = [];
orderOfDays['Пн'] = 1;
orderOfDays['Вт'] = 2;
orderOfDays['Ср'] = 3;
orderOfDays['Чт'] = 4;
orderOfDays['Пт'] = 5;
orderOfDays['Сб'] = 6;
orderOfDays['Вс'] = 7;

function IsReportOnPage()
{
	var isHere = false;
	$("th.time").each(
		function(index)
		{
			if ($(this).text() == "Отчет")
			{
				isHere = true;
			}					
		}			
	);
	
	return isHere;
}


//убирают колонки со страницы, когда на ней есть колонка отчет
function RemoveColumnsWhenReportIsOnPage()
{
	HideCellsInTableHead();
	HideCellsInTableBody();
}

function HideCellsInTableHead()
{
	$("th.time").each(
		function(index)
		{
			if (!(index == 0 || index == ($("th.time").length - 1)))
			{
				$(this).hide();
				$("td.dayoff").attr("colspan", $("td.dayoff").attr("colspan") - 1);
			}				
		}			
	);		
}

function HideCellsInTableBody()
{
	var numberOfRemovedItems = $("th.time").length - 3;			
	$("tbody > tr").each(
		function(index1)
		{				
			var lastItem = $(this).children("td.time").length - 1;
			$(this).children("td.time").each(
				function(index2)
				{	
					if (index2 !=0 && index2 != lastItem)
					{
						$(this).hide();
					}
				}
			);
			if ($(this).hasClass("future"))
			{
				$(this).children("td.time").hide();
				$(this).children().not("td[class]").each(
					function(index)
					{
						if (index < numberOfRemovedItems)
						{
							$(this).hide();
						}
					}
				);
			}
		}
	);
}


// убирают колонки со страницы и добавляют колонку отчет
function RemoveColumnsWhenThereIsNoReport()
{
	HideAllCellsInTableHeadWhenNoReport();
	HideAllCellsInTableBodyWhenNoReport();
	AddReportColumn();
}

function HideAllCellsInTableHeadWhenNoReport()
{
	$("th.time").each(
		function(index)
		{
			if (index != 0)
			{
				$(this).hide();
				$("td.dayoff").attr("colspan", $("td.dayoff").attr("colspan") - 1);
			}				
		}			
	);	
}

function HideAllCellsInTableBodyWhenNoReport()
{	
	var numberOfRemovedItems = $("th.time").length - 2;			
	$("tbody > tr").each(
		function(index1)
		{	
			$(this).children("td.time").each(
				function(index2)
				{	
					if (index2 !=0)
					{
						$(this).hide();
					}
				}
			);
			if ($(this).hasClass("future"))
			{
				$(this).children("td.time").hide();
				$(this).children().not("td[class]").each(
					function(index)
					{
						if (index < numberOfRemovedItems)
						{
							$(this).hide();
						}
					}
				);
			}
		}
	);
}

function AddReportColumn()
{
	var newHeader = $("<th></th>", {
		 "class": "time"
	}).append("Отчет");
	$("th.time").last().after(newHeader);
	
	$("tr[id]")
	.not(".future")
	.not('.trTimeChecker')
	.not('.other')
	.not('.header')
	.each( 
		function(index)
		{
			var newTime = DifferenceOfTime($(this).children("td.time").first().text(), "00:30");
			var newCell = $("<td></td>",{
				"class": "time",
			}).append(newTime);
			$(this).children("td.time").last().after(newCell);
		}
	)
	
	$("td.dayoff").attr("colspan", +$("td.dayoff").attr("colspan") + 1);
	
}



// создание flex box
function CreateFlex()
{
	var flexParent = $("<div></div>",
	{
		"class": "flexParent"
	}).append($("table.full-size"));
	
	$(".mdl-layout__content").append(flexParent);	
}


// добавляет концовку с итогами по времени для месяца
function AddConclusionForMonth()
{		
	var currentTime = GetAlreadyWorkedTimeForMonth();	
    var reportTimeForMonth = GetSumReportTimeForMonth();
	if ($("#NetTime") !== undefined)
	{
		if ($("#NetTime").children("option[selected]").val() == "Yes")
		{
			currentTime = SumOfTime(currentTime, GetTimeOfHolidays());
			reportTimeForMonth = SumOfTime(reportTimeForMonth, GetTimeOfHolidays());
		}
	}
	var thisDayLeft = GetCurrentTimeForCurrentDay();
	var timeForMonthLeft = DifferenceOfTime(GetTimeForMonthLeft(), thisDayLeft);	
	var currentTimeClass;
	
	if (thisDayLeft.indexOf("-") > -1)
	{
		currentTimeClass = "notEnoughWorkTime";
	}
	else
	{
		currentTimeClass = "enoughWorkTime";
	}
	
	var label1_1 = $("<label></label>", {
		id: "text_currentTime"
	}).append("Отработанное время за месяц: ");
	
	var label1_2 = $("<label></label>", {
		id: "currentTime"
	}).append(currentTime);
	
	
	var label2_1 = $("<label></label>", {
		id: "text_thisDayLeft",
		"class": currentTimeClass
	}).append("Остаток на текущий день: ");
	
	var label2_2 = $("<label></label>", {
		id: "thisDayLeft",
		"class": currentTimeClass
	}).append(thisDayLeft);
	
	// добавляется, только если есть показ до конца месяца
	
	var label3_1 = $("<label></label>", {
		id: "text_timeForMonthOrWeekLeft"
	}).append("Остаток до конца месяца: ");	
	
	var label3_2 = $("<label></label>", {
		id: "timeForMonthOrWeekLeft"
	}).append(timeForMonthLeft);
	
	var label4_1 = $("<label></label>", {
		id: "text_reportTimeForMonth"
	}).append("Норма за этот месяц: ");	
	
	var label4_2 = $("<label></label>", {
		id: "reportTimeForMonth"
	}).append(reportTimeForMonth);
	
	var span1 = $('<span class="timeStatisticsSpan" id="span_thisDayLeft"></span>')
	.append(label2_1, label2_2);
	
	var span2 = $('<span class="timeStatisticsSpan" id="span_timeForMonthOrWeekLeft"></span>')
	.append(label3_1, label3_2);
	
	var span3 = $('<span class="timeStatisticsSpan" id="span_currentTime"></span>')
	.append(label1_1, label1_2);
	
	var span4 = $('<span class="timeStatisticsSpan" id="span_reportTimeForMonth"></span>')
	.append(label4_1, label4_2);
	
	var conclusionDiv = $("<div></div>", {
		"class": "conclusion month mdl-card mdl-shadow--2dp",
	})
	.append('<div><b>Статистика:</b></div>')
	.append(span1, span2, "<br>", span3, span4);
	
	$(".flexParent").append(conclusionDiv);
	
	// проверяет, есть ли показ до конца месяца
	if ($(".future").length == 0)
	{
		$("#span_timeForMonthOrWeekLeft").hide();
		
		/*
		var today = new Date();		
		var mm = today.getMonth()+1; //January is 0!
		var yyyy = today.getFullYear();
		today = '?date=' + mm + '.' + yyyy;		
		
		if ((window.location.search == '' || window.location.search == today) && !isLastDayOfMonth())
		{
			$("#span_reportTimeForMonth").hide();
		}*/
	}
	
	AddTooltipAbout30Minutes();
	SetConclusionHeight();
}

function isLastDayOfMonth()
{
	var today = new Date();	
	var test = new Date(today.getTime()), 
		month = test.getMonth();
	test.setDate(test.getDate() + 1);
	return test.getMonth() !== month;
}

function AddStringWhenLunch(title)
{
	return title + '<span class="lunchTimeSpan"><br>(с учетом 30 минут обеда)</span>';
}

function AddStringWhenThereIsNoLunch(title)
{
	return title + '<span class="lunchTimeSpan"><br>(без учета 30 минут обеда)</span>'
}

function AddTooltipAbout30Minutes()
{
	var title1_month = AddStringWhenLunch('Время, которое осталось отработать сегодня');
	var title2_month = AddStringWhenLunch('Время, которое осталось отработать до выполнения <br>нормы за месяц');
	var title3_month = AddStringWhenThereIsNoLunch('Сколько времени Вы отработали <br>в этом месяце');
	var title4_month = AddStringWhenThereIsNoLunch('Сколько всего времени нужно отработать в этом месяце');
	
	var title2_week = AddStringWhenLunch('Время, которое осталось отработать до выполнения <br>нормы за неделю');
	var title3_week = AddStringWhenThereIsNoLunch('Сколько времени Вы отработали <br>на этой неделе');
	var title4_week = AddStringWhenThereIsNoLunch('Сколько всего времени нужно отработать на этой неделе');
	
	
	ChangeTitleToMDTooltip('span_thisDayLeft', title1_month);
	ChangeTitleToMDTooltip('span_timeForMonthOrWeekLeft', title2_month);
	ChangeTitleToMDTooltip('span_currentTime', title3_month);
	ChangeTitleToMDTooltip('span_reportTimeForMonth', title4_month);
	
	ChangeTitleToMDTooltip('span_thisDayLeft_week', title1_month);
	ChangeTitleToMDTooltip('span_timeForMonthOrWeekLeft_week', title2_week);
	ChangeTitleToMDTooltip('span_currentTime_week', title3_week);	
	ChangeTitleToMDTooltip('span_reportTimeForWeek_week', title4_week);
}

function GetAlreadyWorkedTimeForMonth()
{
	var time = $(".summary").last().children(".time").first().text();
	$("tr[id]")
	.not(".future")
	.not('.trTimeChecker')
	.not('.other')
	.not('.header')
	.each(
		function (index)
		{
			time = DifferenceOfTime(time, "00:30")
		}
	);
	return time;
}

function GetAlreadyWorkedTimeForMonth_ForStudent()
{
	return $(".summary").last().children(".time").first().text();
}

function GetTimeOfHolidays()
{
	var day = new Date();		
	var d = day.getDate();
	var times = 0;
	$("tr.dayoff").not('tr[id]').each(
		function()
		{
			if (parseInt($(this).children('td.monthday.number').text()) <= parseInt(d))
			{
				times++;
			}
		}
	);
	var hours = 8 * times;
	return hours + ":00";
}


function GetCurrentTimeForCurrentDay()
{	
	return $(".summary:contains('Итог')").not(":contains('за месяц')").last().children(".time").eq(2).text();
}

function GetTimeForMonthLeft()
{
	var sum = "00:00";
	$("tr.future > td.time").each(
		function(index)
		{
			sum = SumOfTime(sum, $(this).text());			
		}
	);
	
	return sum;
}

function GetSumReportTimeForMonth()
{
	var sum = "00:00";
	$("tr.future > td.time").each(
		function(index)
		{
			sum = SumOfTime(sum, DifferenceOfTime($(this).text(), "00:30"));			
		}
	);
	
	$("tr[id]")
	.not(".future")
	.not('.trTimeChecker')
	.not('.other')
	.not('.header')
	.each(
		function(index)
		{
			sum = SumOfTime(sum, DifferenceOfTime($(this).children(".time").eq(1).text(), "00:30"));
		}
	)
	
	return sum;	
}

function GetSumReportTimeForMonth_ForStudent()
{
	var sum = "00:00";
	$("tr.future > td.time").each(
		function(index)
		{
			sum = SumOfTime(sum, $(this).text());			
		}
	);
	
	$("tr[id]")
	.not(".future")
	.not('.trTimeChecker')
	.not('.other')
	.not('.header')
	.each(
		function(index)
		{
			sum = SumOfTime(sum, $(this).children(".time").eq(1).text());
		}
	)
	
	return sum;	
}


// убирает концовку для месяца
function RemoveConclusionForMonth()
{
	$(".flexParent .barrier").remove();
	$(".conclusion.month").remove();
}


// добавляет концовку с итогами по времени для недели
function AddConclusionForWeek()
{	
	var thisDayLeft = GetCurrentTimeForCurrentDay();
	var currentTimeClass;
	
	if (thisDayLeft.indexOf("-") > -1)
	{
		currentTimeClass = "notEnoughWorkTime";
	}
	else
	{
		currentTimeClass = "enoughWorkTime";
	}
		
	var timeForWeekLeft = GetTimeForWeekLeft();
	
	var currentTime = GetCurrentTimeForWeek();
	
	var reportTimeForWeek = GetSumReportTimeForWeek();
	
	if ($("#NetTime") !== undefined)
	{
		if ($("#NetTime").children("option[selected]").val() == "Yes")
		{
			currentTime = SumOfTime(currentTime, GetTimeOfHolidaysForWeek());
			reportTimeForWeek = SumOfTime(reportTimeForWeek, GetTimeOfHolidaysForWeek());
		}
	}	
	
	var label2_1 = $("<label></label>", {
		id: "text_thisDayLeft_week",
		"class": currentTimeClass
	}).append("Остаток на текущий день: ");
	
	var label2_2 = $("<label></label>", {
		id: "thisDayLeft_week",
		"class": currentTimeClass
	}).append(thisDayLeft);
	
	
	var label3_1 = $("<label></label>", {
		id: "text_timeForMonthOrWeekLeft_week"
	}).append("Остаток до конца недели: ");	
	
	var label3_2 = $("<label></label>", {
		id: "timeForMonthOrWeekLeft_week"
	}).append(timeForWeekLeft);
	
	
	var label1_1 = $("<label></label>", {
		id: "text_currentTime_week"
	}).append("Отработанное время за неделю: ");
	
	var label1_2 = $("<label></label>", {
		id: "currentTime_week"
	}).append(currentTime);	
	
	var label4_1 = $("<label></label>", {
		id: "text_reportTimeForWeek_week"
	}).append("Норма за неделю: ");	
	
	var label4_2 = $("<label></label>", {
		id: "reportTimeForWeek_week"
	}).append(reportTimeForWeek);	

	var span1 = $('<span class="timeStatisticsSpan" id="span_thisDayLeft_week"></span>')
	.append(label2_1, label2_2);
	
	var span2 = $('<span class="timeStatisticsSpan" id="span_timeForMonthOrWeekLeft_week"></span>')
	.append(label3_1, label3_2);
	
	var span3 = $('<span class="timeStatisticsSpan" id="span_currentTime_week"></span>')
	.append(label1_1, label1_2);
	
	var span4 = $('<span class="timeStatisticsSpan" id="span_reportTimeForWeek_week"></span>')
	.append(label4_1, label4_2);
	
	var conclusionDiv = $("<div></div>", {
		"class": "conclusion week mdl-card mdl-shadow--2dp",
	})
	.append('<div><b>Статистика:</b></div>')
	.append(span1, span2, "<br>", span3, span4);
	
	$(".flexParent").append(conclusionDiv);
	
	var today = new Date();		
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();
	today = '?date=' + mm + '.' + yyyy;
	
	// проверяет, есть ли показ до конца месяца
	if ($(".future").length == 0 && (window.location.search == '' || window.location.search == today) && !isLastDayOfMonth())
	{
		$("#span_timeForMonthOrWeekLeft_week").hide();
		$("#span_reportTimeForWeek_week").hide();
	}

	AddTooltipAbout30Minutes();
	SetConclusionHeight();	
}

function GetTimeForWeekLeft()
{	
	var sumNormal = "00:00";
	var sumRealTime = "00:00";
	
	$("tr.intervalRow")
	.not('[style~="display: none;"]')
	.first()
	.nextAll()
	.not('.trTimeChecker')
	.not('.other')
	.not('.header')
	.each(
		function()
		{
			if ($(this).hasClass("intervalRow"))
			{
				return false;
			}
			if ($(this).attr("id") !== undefined)
			{	
				if (($(this).hasClass("future")))
				{
					sumNormal = SumOfTime(sumNormal, $(this).children(".time").first().text());
				}
				else
				{
					sumNormal = SumOfTime(sumNormal, $(this).children(".time").eq(1).text());
					sumRealTime = SumOfTime(sumRealTime, $(this).children(".time").first().text());				
				}
			}				
		}
	);
	return DifferenceOfTime(sumNormal, sumRealTime);
}

function GetCurrentTimeForWeek()
{
	var sum = "00:00";
	$("tr[id]")
	.not(".future")
	.not('.trTimeChecker')
	.not('.other')
	.not('.header')
	.not('[style~="display: none;"]')
	.each(
		function(index)
		{
			sum = SumOfTime(sum, DifferenceOfTime($(this).children(".time").first().text(), "00:30"));
		}
	)
	return sum;
}

function GetCurrentTimeForWeek_ForStudent()
{
	var sum = "00:00";
	$("tr[id]").not(".future").not('[style~="display: none;"]').each(
		function(index)
		{
			sum = SumOfTime(sum, $(this).children(".time").first().text());
		}
	)
	return sum;
}

function GetTimeOfHolidaysForWeek()
{	
	var hours = 8 * $("tr.dayoff").not('tr[id]').not('[style~="display: none;"]').length;
	return hours + ":00";
}

function GetSumReportTimeForWeek()
{
	var sum = "00:00";
	$('tr.intervalRow')
	.not('[style~="display: none;"]')
	.first()
	.nextUntil('tr.intervalRow')
	.filter('tr[id]')
	.not('.trTimeChecker')
	.not('.other')
	.not('.header')
	.each(
		function(index)
		{
			if ($(this).hasClass('future'))
			{				
				sum = SumOfTime(sum, DifferenceOfTime($(this).children('td.time').text(), "00:30"));
			}
			else
			{
				sum = SumOfTime(sum, DifferenceOfTime($(this).children("td.time").eq(1).text(), "00:30"));
			}					
		}
	);
	
	return sum;	
}

function GetSumReportTimeForWeek_ForStudent()
{
	var sum = "00:00";
	$('tr.intervalRow')
	.not('[style~="display: none;"]')
	.first()
	.nextUntil('tr.intervalRow')
	.filter('tr[id]')
	.not('.trTimeChecker')
	.not('.other')
	.not('.header')
	.each(
		function(index)
		{
			if ($(this).hasClass('future'))
			{				
				sum = SumOfTime(sum, $(this).children('td.time').text());
			}
			else
			{
				sum = SumOfTime(sum, $(this).children("td.time").eq(1).text());
			}					
		}
	);
	
	return sum;	
}


// убирает концовку для недели
function RemoveConclusionForWeek()
{
	$(".flexParent .barrier").remove();
	$(".conclusion.week").remove();
}


// функции подсчета времени
function SumOfTime(time1, time2)
{
	if (time1.toString().indexOf("-") > -1 && time2.toString().indexOf("-") > -1)
	{
		return "-" + SumOfTime(time1.substr(1), time2.substr(1));
	}
	
	if (time1.toString().indexOf("-") > -1)
	{
		return DifferenceOfTime(time2, time1.substr(1));		
	}	
	
	if (time2.toString().indexOf("-") > -1)
	{
		return DifferenceOfTime(time1, time2.substr(1));		
	}	
	
	// дальше считается для неотрицательных значений
	var position1 = +time1.indexOf(":");
	var position2 = +time2.indexOf(":");
	var hours1 = +time1.substr(0, position1);
	var hours2 = +time2.substr(0, position2);
	var minutes1 = +time1.substr(position1 + 1);	
	var minutes2 = +time2.substr(position2 + 1);
	var sumHours = +(hours1 + hours2) + Math.floor((minutes1 + minutes2)/60);
	var sumMinutes = +(minutes1 + minutes2) % 60;
	return sumHours + ":" + Pad(sumMinutes,2);
}

function Pad(num, size) 
{
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

function DifferenceOfTime(time1, time2)
{
	if (time1.toString().indexOf("-") > -1 && time2.toString().indexOf("-") > -1)
	{
		return DifferenceOfTime(time2.substr(1), time1.substr(1));
	}
	
	if (time1.toString().indexOf("-") > -1)
	{
		return "-" + SumOfTime(time1.substr(1), time2);		
	}	
	
	if (time2.toString().indexOf("-") > -1)
	{
		return SumOfTime(time1, time2.substr(1));		
	}	
	
	// дальше считается для неотрицательных значений
	var position1 = +time1.indexOf(":");
	var position2 = +time2.indexOf(":");
	var hours1 = +time1.substr(0, position1);
	var hours2 = +time2.substr(0, position2);
	var minutes1 = +time1.substr(position1 + 1);	
	var minutes2 = +time2.substr(position2 + 1);
	var differenceHours, differenceMinutes;
	if (hours1 < hours2) /*!!!!! < or <= */
	{
		differenceHours = +(hours2 - hours1) + Math.floor((minutes2 - minutes1)/60);
		differenceMinutes = +(minutes2 - minutes1);
		if (minutes2 < minutes1)	
		{			
			differenceMinutes += 60;
		}
		if (differenceHours.toString().indexOf("-") > -1)
		{
			differenceHours = differenceHours.toString().substr(1);
		}
		else
		{
			if (!(differenceHours == 0 && differenceMinutes == 0))
			{
				differenceHours = "-" + differenceHours;
			}
		} 		
	}
	if (hours1 >= hours2)
	{
		if (hours1 > hours2)
		{
			differenceHours = +(hours1 - hours2) + Math.floor((minutes1 - minutes2)/60);
			differenceMinutes = +(minutes1 - minutes2);
			if (minutes1 < minutes2)
			{				
				differenceMinutes += 60;
			}				
		}
		else
		{
			if (minutes1 >= minutes2)
			{
				differenceHours = "00";
				differenceMinutes = +(minutes1 - minutes2);
			}
			else
			{
				differenceHours = "-0";
				differenceMinutes = +(minutes2 - minutes1);
			}
		}
	}
	var ret = differenceHours + ":" + Pad(differenceMinutes,2);
	return ret;
}


// остальные функции
function SeparateStartAndFinish()
{	
	var thFinish =  $("<th></th>", 
	{
		"class": "text range",
	})
	.append("Окончание");
	$("th.text.range").text("Начало").after(thFinish);
	
	var timeOfLeavingSpan_title, timeOfLeavingSpan_id = "timeOfLeavingSpan";
	
	$("td.range.text").each(
		function()
		{
			var start = "", finish = "", positionCurrent, startCurrent = "", finishCurrent = "";
			var timeRange = "", timeRangeSpan;
			
			$(this).children("span").each(
				function()
				{
					timeRangeSpan = $(this);
					timeRange = timeRangeSpan.text();
					
					if (timeRange == " ... ") {
						timeOfLeavingSpan_title = timeRangeSpan.attr("title");
						finish += "<span id='" + timeOfLeavingSpan_id + "'>...</span>"
						+ "<br>";
					} else {
						positionCurrent = timeRange.indexOf("—");
						if (positionCurrent > -1)
						{
							startCurrent = timeRange.substr(0, positionCurrent);
							finishCurrent = timeRange.substr(positionCurrent + 1);
							start += startCurrent + "<br>";
							if (finishCurrent != "")
							{
								finish += finishCurrent + "<br>";
							}
						} else {
							timeRangeSpan.parent().nextAll('td.note.text').first().append(timeRangeSpan);
						}
					}
				}
			);
			
			var tdFinish =  $("<td></td>", 
			{
				"class": "range text",
			}).append(finish);
			
			if ($(this).children("span").hasClass("remote"))
			{				
				var tdSpanFinish = $("<span></span>",
				{
					"class": "remote",
				}).append(tdFinish.html());
				tdFinish.empty().append(tdSpanFinish);	

				start = $("<span></span>",
				{
					"class": "remote",
				}).append(start);				
			}
					
			$(this).empty().append(start).after(tdFinish);
			
			if ($(this).text() == "")
			{
				AddWarningForEmptyTime.apply($(this).get(0), ["прихода"]);
			}
			
			if ($(this).next().text() == "")
			{
				AddWarningForEmptyTime.apply($(this).next().get(0), ["ухода"]);
			}
		}
	);
	var size = ($("td.dayoff").attr("colspan"));
	$("td.dayoff").attr("colspan", ++size);
	
	$("td.text[colspan]").each(
		function(index)
		{
			size = $(this).attr("colspan");
			$(this).attr("colspan", ++size );
		}
	)	
	
	$("tr.future").each(
		function(index)
		{
			var newItem = $("<td></td>");
			$(this).append(newItem);
		}
	)
	
	ChangeTitleToMDTooltip(timeOfLeavingSpan_id, timeOfLeavingSpan_title);
	$('table.full-size td.note.text span.hidden-text').each(
		function(index) {
			var id = 'spaninfo' + index;
			$(this).attr('id', id);
			ChangeTitleToMDTooltip(id, $(this).attr('title'));
			$(this).removeAttr('title');
		}
	);
	
}

function AddWarningForEmptyTime(type)
{
	$(this).append('<i class="material-icons" style="color: gray;" ' 
		+ 'title="Не зарегистрировано <br> время ' 
		+ type 
		+ '">warning</i>');
}

function RemoveUnnesessaryBlocks()
{
	$(".future").hide();
	$(".summary").hide();
}

function AddRowBetweenWeeksWithWeekNumber()
{	
	var length = +$("th").not('[style~="display: none;"]').length + 1;
	AddFirstRowBetweenWeeks(length);
	var numberOfWeek = 2;
	var previousDay = $("tr[id], tr.dayoff")
	.not('.trTimeChecker')
	.not('.other')
	.not('.header')
	.first();
	
	$("tr[id], tr.dayoff")
	.not('.trTimeChecker')
	.not('.other')
	.not('.header')
	.each(
		function(index)
		{
			if (!$(this).prev().hasClass("intervalRow"))
			{
				if (orderOfDays[$(this).children().first().text()]  <= orderOfDays[previousDay.children().first().text()])
				{		
					titleOfWeek = numberOfWeek + "-я неделя."
					
					var cell = $("<td></td>",
					{
						"class": "intervalCell"	,	
						"colspan": length,
					}).append(titleOfWeek);
					numberOfWeek++;
					var row = $("<tr></tr>",
					{
						"class": "intervalRow",
					}).append(cell);					
					$(this).before(row);
					if($(this).hasClass("future"))
					{
						row.addClass("future");
						row.hide();
					}						
				}
			}	
			previousDay = $(this);
		}
	);
	DivideDayoffIntoParts();
}

function AddFirstRowBetweenWeeks(length)
{
	var firstCell = $("<td></td>",
	{
		"class": "intervalCell"	,	
		"colspan": length,
	}).append("1-я неделя.");
	var firstRow = $("<tr></tr>",
	{
		"class": "intervalRow",
	}).append(firstCell);
	$("tbody").prepend(firstRow);
}

function DivideDayoffIntoParts()
{
	$("tr.intervalRow").each(
		function(index)
		{
			if ($(this).prev().hasClass("dayoff")
				&& $(this).next().hasClass("dayoff")
				&& $(this).next().children("td.dayoff").length == 0
				&& $(this).next().children('td.time').length == 0)
			{		
				var rows = $(this).prevUntil(".intervalRow").filter("tr.dayoff");
				var newDayoff = $("td.dayoff").first().clone();			
				
				for (var i = 0; i < rows.length; i++) {								
					if ($(rows[i]).children('td.dayoff').length > 0)
					{
						newDayoff = $(rows[i]).children('td.dayoff').first().clone();						
						break;
					}
				}
				
				$(this).next().append(newDayoff);				
			}
		}
	);
	

	$("td.dayoff").attr("colspan", "5").each(
		function(index)
		{			
			var rowspan = 1;
			$(this).parent().nextUntil(".intervalRow").filter("tr.dayoff").each(
				function(index)
				{
					if ($(this).children("td.dayoff").length != 0
						|| $(this).children("td.time").length != 0)
					{
						return false;
					}
					rowspan++;
				}
			);
			
			$(this).attr("rowspan", rowspan);
		}
	);
}

function WriteFullNamesOfDays()
{
	$("td.weekday").each(
		function(index)
		{
			switch($(this).text())
			{
				case "Пн":
					$(this).text("Понедельник");
					break;
				case "Вт":
					$(this).text("Вторник");
					break;
				case "Ср":
					$(this).text("Среда");
					break;
				case "Чт":
					$(this).text("Четверг");
					break;
				case "Пт":
					$(this).text("Пятница");
					break;
				case "Сб":
					$(this).text("Суббота");
					break;
				case "Вс":
					$(this).text("Воскресенье");
					break;
				default:
					break;
			}
		}
	)
}

function CreateSettings()
{
	$("div.mdl-layout__drawer").append($("<div id=settings></div>"));
	$("#settings").load("http://co-msk-app02/Preferences/Edit form", 
		function()
		{
			$("#settings").hide();
			// remove rus/eng switch from time settings
			$("div.table-form").eq(0).remove();
			$("#settings").prepend("<br><label><b>Настройки:</b></label><br><br>");
			$("#ReturnTo").val("/Personal" + window.location.search);
			$("#settings a").hide();
			$("#settings label").removeAttr("for");
			$("#settings label").after("<br>");
			$("div.table-form").last().next().css(
			{
				paddingTop: "2em"
			});
			
			
			$("div.table-form").eq(0).children("label").text('Округлять "отчетное" время');
			
			$("div.table-form").eq(1).children("label").text('Учитывать отпуск в отработанном времени за месяц');
			$("div.table-form").eq(2).children("label").text('Я студент');
			$("div.table-form").eq(4).children("label").text('Cчитать остаток и норму до конца месяца/недели');
			$("div.table-form").eq(3).hide();
			
			var today = new Date();		
			var mm = today.getMonth()+1; //January is 0!
			var yyyy = today.getFullYear();
			today = '?date=' + mm + '.' + yyyy;
			
			if (!(window.location.search == '' || window.location.search == today) 
				|| ((window.location.search == '' || window.location.search == today)
					&& $('.future').length == 0 
					&& $("div.table-form").eq(4).children('select').first().children('option[selected]').val() == 'Yes'))
			{
				$("div.table-form").eq(4).hide();
			}
			
			if($("div.table-form").eq(1)
				.children("select").first()
				.children("option[selected]").val() == "Yes")
			{
				$("#currentTime").text(SumOfTime(GetAlreadyWorkedTimeForMonth(), GetTimeOfHolidays()));
				$("#currentTime_week").text(SumOfTime(GetCurrentTimeForWeek(), GetTimeOfHolidaysForWeek()));
				$("#reportTimeForMonth").text(SumOfTime(GetSumReportTimeForMonth(), GetTimeOfHolidays()));
				$("#reportTimeForWeek_week").text(SumOfTime(GetSumReportTimeForWeek(), GetTimeOfHolidaysForWeek()));
				
			}
			else
			{
				$("#currentTime").text(GetAlreadyWorkedTimeForMonth());				
				$("#currentTime_week").text(GetCurrentTimeForWeek());
			}
			
			if($("div.table-form").eq(2)
				.children("select").first()
				.children("option[selected]").val() == "Yes")
			{				
				isStudent = true;
				SetUpTimeForStudent();			
			}
			
			ReplaceInput.apply($("form[action='/Preferences/Edit'] input[type=submit]").get(0));
			ChangeButtonsToMD.apply($("form[action='/Preferences/Edit'] button.inputReplaceButton").get(0));	

			$("form[action='/Preferences/Edit'] button.inputReplaceButton").parent()
			.css("width", "0px");

			$("div.table-form select").each(
				function()
				{
					var input = $('<input type="checkbox" id="checkbox_' + $(this).attr("id") + '" class="mdl-switch__input">');
					var span = $('<span class="mdl-switch__label"></span>');
					var label = $('<label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="checkbox_' 
						+ $(this).attr("id") + '">')
						.append(input, span);
						
					$(this).after(label);
					$(this).hide();
					if ($(this).val() == "Yes")
					{
						input.attr("checked", "checked");
					}
					
					componentHandler.upgradeElement(label.get(0));			
					
				}
			);
			
			$("#settings").fadeIn("fast");
			
			$("form[action='/Preferences/Edit'] button.inputReplaceButton").click(
				function()
				{
					$("div.table-form select").each(
						function()
						{
							if ($('#checkbox_' + $(this).attr("id")).parent().hasClass("is-checked"))
							{
								$(this).val("Yes");
							}
							else
							{
								$(this).val("No");
							}
						}
					);
				}
			);
		}
	);
}

function SetUpTimeForStudent()
{
	if (isStudent)
	{
		$("tr[id]")
		.not(".future")
		.not('.trTimeChecker')
		.not('.other')
		.not('.header')
		.each( 
			function(index)
			{
				var newText = $(this).children("td.time").first().text();
				$(this).children("td.time").last().empty().text(newText);
			}
		);
		
		$("label#currentTime").text(GetAlreadyWorkedTimeForMonth_ForStudent());
		$("label#reportTimeForMonth").text(GetSumReportTimeForMonth_ForStudent());	
		$("label#currentTime_week").text(GetCurrentTimeForWeek_ForStudent());
		$("label#reportTimeForWeek_week").text(GetSumReportTimeForWeek_ForStudent());
		AddSpansForDifferentTypesOfTime();
		$('.conclusion div.mdl-tooltip span.lunchTimeSpan').remove();
	}
}

function SetTableHeightForTime()
{
	var tbody = $("table.full-size tbody");
	var height = $(window).height()
		- $('header.mdl-layout__header').outerHeight(true)
		- $('main.mdl-layout__content.content-wide span.mdl-layout-title').outerHeight(true)
		- $('table.full-size thead').outerHeight(true)
		- 50;

	if (tbody.parent().outerWidth(true) + $('div.conclusion').outerWidth(true) > $('div.flexParent').width())
	{
		height = height - $('div.conclusion').outerHeight(true) - 45;
	}
	
	if (!isMonth)
	{
		height = height - $('div.buttonDiv').outerHeight(true);
	}
		
	tbody.outerHeight(height);
	
	if (tbody.get(0).scrollHeight <= tbody.get(0).clientHeight)
	{
		tbody.css('height', 'auto');
	}
}

function SetConclusionHeight()
{
	var conclusionHeight = 20 * ($('div.conclusion span.timeStatisticsSpan').not('[style~="display: none;"]').length + 2);
	$('div.conclusion').height(conclusionHeight);
}

function AddTooltips_workScript()
{
	$("i:contains('warning')").each(
		function(index)
		{			
			if ($(this).attr("title") === undefined)
			{
				return true;
			}
			var id = "i_warning_" + index;
			var title = $(this).attr("title");
			$(this).removeAttr("title");
			$(this).attr("id", id);
			ChangeTitleToMDTooltip(id, title);			
		}
	);
}

function AddButtonToShowTimeInDecimals()
{	
	var id = 'timeChangeToDecimalButton';
	var title = 'Показвать время<br>в дробях';
	var button = $('<button id="' + id + '" class="mdl-button mdl-js-button mdl-button--icon' 
			+' mdl-js-ripple-effect"><i class="material-icons">alarm</i></button>');
	
	$('th.time:contains("Отчет")').append(button);
	componentHandler.upgradeElement(button.get(0));
	
	
	var tooltip = $('<div class="mdl-tooltip" for="' 
		+ id 
		+ '">'
		+ title
		+'</div>');
	$("#" + id).after(tooltip);
	componentHandler.upgradeElement(tooltip.get(0));
}

function AddSpansForDifferentTypesOfTime()
{	
	$('table.full-size tbody tr[id]')
	.not('tr.future')
	.not('.trTimeChecker')
	.not('.other')
	.not('.header')
	.each(
		function()
		{
			var time = $(this).children('td.time').last().text();
			var span1 = $('<span></span>',
			{
				"class": "usualTime"
			}).append(time);

			var position = +time.indexOf(":");
			var hours = +time.substr(0, position);
			var minutes = +time.substr(position + 1);
			var decimaMinutes = +(+ minutes/60).toFixed(2);
			var decimalTime = +hours + decimaMinutes;	

			var span2 = $('<span></span>',
			{
				"class": "decimalTime"
			})
			.append(decimalTime);
			
			$(this).children('td.time').last().empty().append(span1,span2);	
			if ($('#timeChangeToDecimalButton').hasClass('mdl-button--accent'))
			{
				TurnOnDecimals();
			}
			else
			{
				TurnOffDecimals();
			}
		}
	);
}

function TurnOnDecimals()
{	
	$('span.usualTime').hide();
	$('span.decimalTime').show();	
}

function TurnOffDecimals()
{
	$('span.usualTime').show();
	$('span.decimalTime').hide();
}


$(document).ready
( 
	function() 
	{
		if(IsReportOnPage())
		{
			RemoveColumnsWhenReportIsOnPage();
		}			
		else
		{
			RemoveColumnsWhenThereIsNoReport();
		}
		SeparateStartAndFinish();		
		RemoveUnnesessaryBlocks();
		AddRowBetweenWeeksWithWeekNumber();
		WriteFullNamesOfDays();	
		CreateSettings();
		ShowTableFullSizeAndHolidayBox();
		
		var shouldBeHidden = false;
		
		
		
		$("table.full-size th")
		.first()
		.removeAttr("colspan")
		.addClass("weekday")
		.after("<th class='monthday number'>№</th>");
		
		CreateFlex();		
		AddConclusionForMonth();
		
		AddTooltips_workScript();
		AddButtonToShowTimeInDecimals();
		AddSpansForDifferentTypesOfTime();	
		
		$(window).resize(
			function() 
			{
				SetTableHeightForTime();
			}
		).resize(); // Trigger resize handler
		
		$('#timeChangeToDecimalButton').click(
			function()
			{
				if ($(this).hasClass('mdl-button--accent'))
				{
					$(this).removeClass('mdl-button--accent');
					$('div.mdl-tooltip[for=timeChangeToDecimalButton]').html('Показвать время<br>в дробях');
					TurnOffDecimals();
				}
				else
				{
					$(this).addClass('mdl-button--accent')					
					$('div.mdl-tooltip[for=timeChangeToDecimalButton]').html('Показвать время<br>в часах/минутах');
					TurnOnDecimals();
				}
			}
		);
		
		
		
		$("tr.intervalRow").click(
			function()
			{
				if (!isMonth)
				{
					$(".intervalRow").show();
					
					$("tr[id]")
					.not('.trTimeChecker')
					.not('.other')
					.not('.header')
					.show();
					
					$(".dayoff").show();
					$(".future").hide();
					RemoveConclusionForWeek();
					AddConclusionForMonth();
					isMonth = true;
					shouldBeHidden = false;
					$(".buttonDiv").remove();
					$(window).resize();
					SetUpTimeForStudent();
					SetTableHeightForTime();
					return;
				}
				$(this).prevAll().each(
					function()
					{
						$(this).hide();
					}
				);
				$(this).nextAll().each(
					function()
					{
						if ($(this).hasClass("intervalRow"))
						{
							shouldBeHidden = true;
						}
						if (shouldBeHidden)
						{
							$(this).hide();
						}
					}
				);
				
				var button = $("<button></button>", {
					"class": "resetButton",
					type: "button"
				}).append("Вернуться к месяцу...");
				
				
				ChangeButtonsToMD.apply(button.get(0));
				
				var div = $("<div></div>", {
					"class": "buttonDiv"
				}).append("<br>", button);
				
				
				var barrier = $("<div></div>", {
					"class": "barrier",
				});
				
				RemoveConclusionForMonth();
				AddConclusionForWeek();	
				isMonth = false;
				$(window).resize();
				SetUpTimeForStudent();
				
				$("table.full-size").parent().append(barrier, div);
				SetTableHeightForTime();

				$(".resetButton").click(
					function()
					{
						if (isMonth)
						{
							SetTableHeightForTime();
							return;
						}
						$(".intervalRow").show();
						
						$("tr[id]")
						.not('.trTimeChecker')
						.not('.other')
						.not('.header')
						.show();
						
						$(".dayoff").show();
						$(".future").hide();
						RemoveConclusionForWeek();
						AddConclusionForMonth();
						isMonth = true;
						shouldBeHidden = false;
						$(".buttonDiv").remove();
						$(window).resize();
						SetUpTimeForStudent();
						SetTableHeightForTime();
					}
				);
			}
		);		
	}
);