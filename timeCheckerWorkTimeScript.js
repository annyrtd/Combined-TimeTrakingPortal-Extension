function CreateCurrentDayButton() {
	
	var button = $('<button></button>', {
		'class': 'mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent',
		id: 'currentDayToggle'
	}).append('Сегодня');
	
	$('main span.mdl-layout-title')
	.css({
		display: 'flex',
		alignItems: 'center',
		minHeight: '65px'
	})
	.append('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;')
	.append(button);
	
	componentHandler.upgradeElement(button.get(0));
}

function SetUpInitialState() {
	var rowsIndex = [];
	var prefix = GetCurrentMonthAndYearPrefix();

	var date = new Date();
	var month = date.getMonth() + 1;
	var year = date.getFullYear();
	
	var currentPeriod = month + '_' + year;
	var storagePeriod = localStorage['currentPeriod'];
	if (storagePeriod) {
		if (storagePeriod != currentPeriod) {
			ShiftLocalStorageData(storagePeriod);
			localStorage['currentPeriod'] = currentPeriod;
		}
	} else {
		localStorage['currentPeriod'] = currentPeriod;
	}


	$('tr[id]:not(.future):not(.trTimeChecker):not(.other):not(.header)').each(
		function() {
			var dayId = $(this).attr('id');
			var index = SetUpDay($(this), prefix);
			rowsIndex[prefix + dayId] = index;
			if (index) {
				localStorage[prefix + dayId] = index;
			} else {
				localStorage.removeItem(prefix + dayId);
			}
		}
	);

	return rowsIndex;
}

/**
 * @return {string}
 */
function GetCurrentMonthAndYearPrefix() {
	var search = window.location.search;
	var objURL = {};

	search.replace(
		new RegExp( "([^?=&]+)(=([^&]*))?", "g" ),
		function( $0, $1, $2, $3 ){
			objURL[ $1 ] = $3;
		}
	);

	var date = objURL.date;
	var realDate = new Date();
	var month = realDate.getMonth() + 1;
	var year = realDate.getFullYear();
	var dateStr = month + '.' + year;

	if (!date || date == dateStr) {
		return '';
	} else {
		return date.replace('.', '_') + '_';
	}

}

function ShiftLocalStorageData(storagePeriod) {
	Object.keys(localStorage)
		.forEach(
			function(key){
				if(key.startsWith('day_')) {
					localStorage[storagePeriod + '_' + key] = localStorage[key];
					localStorage.removeItem(key);
				} else {
					if (localStorage.includes('day_')) {
						localStorage.removeItem(key);
					}
				}
			}
		);
}

function SetUpDay(currentRow, prefix) {
	var dayId = currentRow.attr('id');

	var index = 0;
	var tempMainRow, tempSubtaskRow, startTime;

	var headerRow = CreateHeaderRow(dayId, prefix);
	currentRow.after(headerRow);

	var previous = headerRow;

	if (localStorage[prefix + dayId]) {
		index = localStorage[prefix + dayId];
		for(var i = 0; i < index; i++) {
			tempMainRow = CreateTimeCheckerRow(dayId, prefix, i);
			//tempMainRow = CreateEmptyTimeCheckingRow(i, dayId);

			tempMainRow.find('[idtype="inputTask"], [idtype="inputComment"], [idtype="inputTime"]').each(function(){
				var self = $(this);
				var id = self.attr('id');
				if (localStorage[id]) {
					self.val(localStorage[id]);
				}
			});

			startTime = localStorage[prefix + dayId + '_startTime' + i + '-0'];

			if (startTime) {
				SetUp_StartTime(tempMainRow, startTime);
			}

			previous.after(tempMainRow);
			previous = tempMainRow;

			if (localStorage[prefix + dayId + '_' + i]) {
				var subtaskCount = +localStorage[prefix + dayId + '_' + i];
				for(var j = 1; j < subtaskCount; j++) {
					tempSubtaskRow = CreateTimeCheckerRow(dayId, prefix, i, j);
					//tempSubtaskRow = CreateSubtaskRow(i, j, dayId);

					tempSubtaskRow.find('[idtype="inputTask"], [idtype="inputComment"], [idtype="inputTime"]').each(function(){
						var self = $(this);
						var id = self.attr('id');
						if (localStorage[id]) {
							self.val(localStorage[id]);
						}
					});

					startTime = localStorage[prefix + dayId + '_startTime' + i + '-' + j];

					if (startTime) {
						SetUp_StartTime(tempSubtaskRow, startTime);
					}

					previous.after(tempSubtaskRow);
					previous = tempSubtaskRow;
				}
				tempMainRow.attr('subtaskcount', subtaskCount);
				tempMainRow.children('td').first().attr('rowspan', subtaskCount);
				tempMainRow.children('td').last().attr('rowspan', subtaskCount);
			}
		}
	}
	var emptyRow = CreateTimeCheckerRow(dayId, prefix, index);
	//var emptyRow = CreateEmptyTimeCheckingRow(index, dayId);
	localStorage.removeItem(prefix + dayId + '_' + index);

	previous.after(emptyRow);
	var otherRow = CreateOtherRow(dayId, prefix);
	emptyRow.after(otherRow);

	return index;
}

function SetUp_StartTime(row, startTime) {
	var dayId = row.attr('dayid');

	if (dayId == GetCurrentDayId()) {
		row.find('[idtype=startTime]').text(startTime);
		row.addClass('inProgress');
		row.find('[idtype=buttonTimeStart]').hide();
		row.find('[idtype=buttonTimeStop]').show();
	} else {
		var time = GetTimeLeftForTheTask(dayId, startTime);
		var inputTime = row.find('[idtype=inputTime]');
		var oldValue = inputTime.val();
		if (oldValue) {
			inputTime.val(TCH_SumOfTime(oldValue, time));
		} else {
			inputTime.val(time);
		}
	}
}

/**
 * @return {string}
 */
function GetTimeLeftForTheTask(dayId, time){

	var mapTimes = function(value) {
		value = value.replace(/ /g, '').replace(/&nbsp;/g, '');
		var regExp = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

		if (regExp.test(value)) {
			return TCH_SumOfTime('00:00', value);
		} else {
			return '';
		}
	};

	var dayRow = $('#' + dayId);
	var startTimes = dayRow
		.find('td.range.text').first().html()
		.split('<br>')
		.map(mapTimes);
	var finishTimes = dayRow
		.find('td.range.text').last().html()
		.split('<br>')
		.map(mapTimes);

	var result = '00:00';
	time = TCH_SumOfTime('00:00', time);

	for (var i = 0; i < startTimes.length; i++) {
		if (startTimes[i] && finishTimes[i]) {
			if ((time > startTimes[i]) && (time < finishTimes[i])) {
				result = TCH_SumOfTime(result, TCH_DifferenceOfTime(finishTimes[i], time))
			} else {
				if (time <= startTimes[i]) {
					result = TCH_SumOfTime(result, TCH_DifferenceOfTime(finishTimes[i], startTimes[i]))
				}
			}
		}
	}

	return result;
}

function SetTableHeightForTime() {
	var tbody = $("table.full-size tbody");
	var height = $(window).height()
		- $('header.mdl-layout__header').outerHeight(true)
		- $('main.mdl-layout__content.content-wide span.mdl-layout-title').outerHeight(true)
		- $('table.full-size thead').outerHeight(true)
		- 60;

	var conclusion = $('div.conclusion');

	if (tbody.parent().outerWidth(true) + conclusion.outerWidth(true) > $('div.flexParent').width())
	{
		height = height - conclusion.outerHeight(true) - 45;
	}

	if (!CheckIsMonth())
	{
		height = height
			- $('div.buttonDiv').outerHeight(true);
			- 20;
	}

	tbody.outerHeight(height);

	if (tbody.get(0).scrollHeight <= tbody.get(0).clientHeight)
	{
		tbody.css('height', 'auto');
	}
}

function CheckIsMonth() {
	return $('button.resetButton').length <= 0;
}

function GetCurrentDayId() {
	return $('tr[id]:not(.future):not(.trTimeChecker):not(.other):not(.header)').last().attr('id');
}

/** функции подсчета времени *
 * @return {string}
 */
function TCH_SumOfTime(time1, time2)
{	
	if (time1.toString().indexOf("-") > -1 && time2.toString().indexOf("-") > -1)
	{
		return "-" + TCH_SumOfTime(time1.substr(1), time2.substr(1));
	}

	if (time1.toString().indexOf("-") > -1)
	{
		return TCH_DifferenceOfTime(time2, time1.substr(1));
	}

	if (time2.toString().indexOf("-") > -1)
	{
		return TCH_DifferenceOfTime(time1, time2.substr(1));
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
	return TCH_Pad(sumHours,2) + ":" + TCH_Pad(sumMinutes,2);
}

/**
 * @return {string}
 */
function TCH_Pad(num, size)
{
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

/**
 * @return {string}
 */
function TCH_DifferenceOfTime(time1, time2)
{
	if (time1.toString().indexOf("-") > -1 && time2.toString().indexOf("-") > -1)
	{
		return TCH_DifferenceOfTime(time2.substr(1), time1.substr(1));
	}

	if (time1.toString().indexOf("-") > -1)
	{
		return "-" + TCH_SumOfTime(time1.substr(1), time2);
	}

	if (time2.toString().indexOf("-") > -1)
	{
		return TCH_SumOfTime(time1, time2.substr(1));
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
	return TCH_Pad(differenceHours, 2) + ":" + TCH_Pad(differenceMinutes, 2);
}
/*******************************/

/*
function CreateEmptyTimeCheckingRow(taskIndex, dayId) {

	var inputTask = $('<input />', {
		type: 'text',
		idtype: 'inputTask',
		id: dayId + '_' + 'inputTask' + taskIndex
	})
	.css({
		width: '220px'
	});

	var tdTask = $('<td></td>', {
		colspan: 2
	})
	.append(inputTask);



	var labelStartTime = $('<label></label>', {
		idtype: 'startTime',
		id: dayId + '_' + 'startTime' + taskIndex + '-0'
	});

	var tdStartTime = $('<td></td>', {
		'class': 'subtaskTd'
	})
	.css({
		display: 'none'
	})
	.append(labelStartTime);



	var inputTime = $('<input />', {
		type: 'text',
		idtype: 'inputTime',
		id: dayId + '_' + 'inputTime' + taskIndex + '-0'
	})
	.css({
		width: '70px'
	});

	var iconTimeStart = $('<i class="material-icons">play_arrow</i>');

	var buttonTimeStart = $('<button></button>', {
		'class': 'mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect',
		idtype: 'buttonTimeStart',
		id: dayId + '_' + 'buttonTimeStart' + taskIndex + '-0'
	})
	.append(iconTimeStart);

	var iconTimeStop = $('<i class="material-icons">stop</i>');

	var buttonTimeStop = $('<button></button>', {
		'class': 'mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect',
		idtype: 'buttonTimeStop',
		id: dayId + '_' + 'buttonTimeStop' + taskIndex + '-0'
	})
	.css({
		display: 'none'
	})
	.append(iconTimeStop);


	var tdTime = $('<td></td>', {
		'class': 'subtaskTd'
	})
	.css({
		textAlign: 'center'
	})
	.append(inputTime);

	if (dayId == GetCurrentDayId()) {
		tdTime.append(buttonTimeStart, buttonTimeStop);
	}



	var inputComment = $('<input />', {
		type: 'text',
		idtype: 'inputComment',
		id: dayId + '_' + 'inputComment' + taskIndex + '-0'
	})
	.css({
		width: '180px'
	});

	var iconAddSubtask = $('<i class="material-icons" >add</i>');

	var buttonAddSubtask = $('<button></button>', {
		'class': 'mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect mdl-button--accent',
		idtype: 'buttonAddSubtask',
		id: dayId + '_' + 'buttonAddSubtask' + taskIndex + '-0'
	})
	.append(iconAddSubtask);

	var tdComment = $('<td></td>', {
		colspan: 2,
		'class': 'time subtaskTd'
	})
	.append(inputComment, buttonAddSubtask);



	var iconCloseSubtask = $('<i class="material-icons" >close</i>');

	var buttonCloseSubtask = $('<button></button>', {
		'class': 'mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect',
		idtype: 'buttonCloseSubtask',
		id: dayId + '_' + 'buttonCloseSubtask' + taskIndex + '-0'
	})
	.append(iconCloseSubtask);

	var tdCloseSubtask = $('<td></td>', {
		'class': 'time subtaskTd'
	})
	.append(buttonCloseSubtask);



	var iconDeleteTask = $('<i class="material-icons" >delete</i>');

	var buttonDeleteTask = $('<button></button>', {
		'class': 'mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect',
		idtype: 'buttonDeleteTask',
		id: dayId + '_' + 'buttonDeleteTask' + taskIndex
	})
	.append(iconDeleteTask);

	var tdDeleteTask = $('<td></td>', {
	})
	.append(buttonDeleteTask);



	var subtaskCount = 1;

	var tr = $('<tr></tr>', {
		'class': 'trTimeChecker task',
		idtype: 'trTimeChecker',
		dayid: dayId,
		subtaskcount: subtaskCount,
		taskindex: taskIndex,
		id: dayId + '_' + 'trTimeChecker' + taskIndex
	})
	.append(tdTask, tdStartTime, tdTime, tdComment, tdCloseSubtask, tdDeleteTask);

	componentHandler.upgradeElement(buttonTimeStart.get(0));
	componentHandler.upgradeElement(buttonCloseSubtask.get(0));
	componentHandler.upgradeElement(buttonAddSubtask.get(0));
	componentHandler.upgradeElement(buttonDeleteTask.get(0));

	return tr;
}
*/
 /*
function CreateSubtaskRow(taskIndex, subtaskIndex, dayId) {
	var labelStartTime = $('<label></label>', {
		idtype: 'startTime',
		id: dayId + '_' + 'startTime' + taskIndex + '-' + subtaskIndex
	});

	var tdStartTime = $('<td></td>', {
		'class': 'subtaskTd'
	})
	.css({
		display: 'none'
	})
	.append(labelStartTime);



	var inputTime = $('<input />', {
		type: 'text',
		idtype: 'inputTime',
		id: dayId + '_' + 'inputTime' + taskIndex + '-' + subtaskIndex
	})
	.css({
		width: '70px'
	});

	var iconTimeStart = $('<i class="material-icons">play_arrow</i>');

	var buttonTimeStart = $('<button></button>', {
		'class': 'mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect',
		idtype: 'buttonTimeStart',
		id: dayId + '_' + 'buttonTimeStart' + taskIndex + '-' + subtaskIndex
	})
	.append(iconTimeStart);

	var iconTimeStop = $('<i class="material-icons">stop</i>');

	var buttonTimeStop = $('<button></button>', {
		'class': 'mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect',
		idtype: 'buttonTimeStop',
		id: dayId + '_' + 'buttonTimeStop' + taskIndex + '-0'
	})
	.css({
		display: 'none'
	})
	.append(iconTimeStop);

	var tdTime = $('<td></td>', {
		'class': 'subtaskTd'
	})
	.css({
		textAlign: 'center'
	})
	.append(inputTime);

	if (dayId == GetCurrentDayId()) {
		tdTime.append(buttonTimeStart, buttonTimeStop);
	}



	var inputComment = $('<input />', {
		type: 'text',
		idtype: 'inputComment',
		id: dayId + '_' + 'inputComment' + taskIndex + '-' + subtaskIndex
	})
	.css({
		width: '180px'
	});

	var iconAddSubtask = $('<i class="material-icons" >add</i>');

	var buttonAddSubtask = $('<button></button>', {
		'class': 'mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect mdl-button--accent',
		idtype: 'buttonAddSubtask',
		id: dayId + '_' + 'buttonAddSubtask' + taskIndex + '-' + subtaskIndex
	})
	.append(iconAddSubtask);

	var tdComment = $('<td></td>', {
		colspan: 2,
		'class': 'time subtaskTd'
	})
	.append(inputComment, buttonAddSubtask);



	var iconCloseSubtask = $('<i class="material-icons" >close</i>');

	var buttonCloseSubtask = $('<button></button>', {
		'class': 'mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect',
		idtype: 'buttonCloseSubtask',
		id: dayId + '_' + 'buttonCloseSubtask' + taskIndex + '-' + subtaskIndex
	})
	.append(iconCloseSubtask);

	var tdCloseSubtask = $('<td></td>', {
		'class': 'time subtaskTd'
	})
	.append(buttonCloseSubtask);



	var tr = $('<tr></tr>', {
		'class': 'trTimeChecker subtask',
		idtype: 'trTimeChecker',
		dayid: dayId,
		taskindex: taskIndex,
		subtaskIndex: subtaskIndex,
		id: dayId + '_' + 'trTimeChecker' + taskIndex + '-' + subtaskIndex
	})
	.append(tdStartTime, tdTime, tdComment, tdCloseSubtask);



	componentHandler.upgradeElement(buttonTimeStart.get(0));
	componentHandler.upgradeElement(buttonCloseSubtask.get(0));
	componentHandler.upgradeElement(buttonAddSubtask.get(0));

	return tr;
}

*/

function CreateTimeCheckerRow(dayId, prefix, taskIndex, subtaskIndex) {

	var subtaskIndex = subtaskIndex ? subtaskIndex : 0;

	var inputTask = $('<input />', {
		type: 'text',
		idtype: 'inputTask',
		id: prefix + dayId + '_' + 'inputTask' + taskIndex
	})
		.css({
			width: '220px'
		});

	var tdTask = $('<td></td>', {
		colspan: 2
	})
		.append(inputTask);



	var labelStartTime = $('<label></label>', {
		idtype: 'startTime',
		id: prefix + dayId + '_' + 'startTime' + taskIndex + '-' + subtaskIndex
	});

	var tdStartTime = $('<td></td>', {
		'class': 'subtaskTd'
	})
		.css({
			display: 'none'
		})
		.append(labelStartTime);



	var inputTime = $('<input />', {
		type: 'text',
		idtype: 'inputTime',
		id: prefix + dayId + '_' + 'inputTime' + taskIndex + '-' + subtaskIndex
	})
		.css({
			width: '70px'
		});

	var iconTimeStart = $('<i class="material-icons">play_arrow</i>');

	var buttonTimeStart = $('<button></button>', {
		'class': 'mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect',
		idtype: 'buttonTimeStart',
		id: prefix + dayId + '_' + 'buttonTimeStart' + taskIndex + '-' + subtaskIndex
	})
		.append(iconTimeStart);

	var iconTimeStop = $('<i class="material-icons">stop</i>');

	var buttonTimeStop = $('<button></button>', {
		'class': 'mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect',
		idtype: 'buttonTimeStop',
		id: prefix + dayId + '_' + 'buttonTimeStop' + taskIndex + '-' + subtaskIndex
	})
		.css({
			display: 'none'
		})
		.append(iconTimeStop);


	var tdTime = $('<td></td>', {
		'class': 'subtaskTd'
	}).append(inputTime);

	if (!prefix && dayId == GetCurrentDayId()) {
		tdTime.append(buttonTimeStart, buttonTimeStop);
	}



	var inputComment = $('<input />', {
		type: 'text',
		idtype: 'inputComment',
		id: prefix + dayId + '_' + 'inputComment' + taskIndex + '-' + subtaskIndex
	})
		.css({
			width: '180px'
		});

	var iconAddSubtask = $('<i class="material-icons" >add</i>');

	var buttonAddSubtask = $('<button></button>', {
		'class': 'mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect mdl-button--accent',
		idtype: 'buttonAddSubtask',
		id: prefix + dayId + '_' + 'buttonAddSubtask' + taskIndex + '-' + subtaskIndex
	})
		.append(iconAddSubtask);

	var tdComment = $('<td></td>', {
		colspan: 2,
		'class': 'subtaskTd'
	})
		.append(inputComment, buttonAddSubtask);



	var iconCloseSubtask = $('<i class="material-icons" >close</i>');

	var buttonCloseSubtask = $('<button></button>', {
		'class': 'mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect',
		idtype: 'buttonCloseSubtask',
		id: prefix + dayId + '_' + 'buttonCloseSubtask' + taskIndex + '-' + subtaskIndex
	})
		.append(iconCloseSubtask);

	var tdCloseSubtask = $('<td></td>', {
		'class': 'time subtaskTd'
	})
		.append(buttonCloseSubtask);



	var iconDeleteTask = $('<i class="material-icons" >delete</i>');

	var buttonDeleteTask = $('<button></button>', {
		'class': 'mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect',
		idtype: 'buttonDeleteTask',
		id: prefix + dayId + '_' + 'buttonDeleteTask' + taskIndex
	})
		.append(iconDeleteTask);

	var tdDeleteTask = $('<td></td>', {
		'class': 'time'
	})
		.append(buttonDeleteTask);


	var tr;

	if (subtaskIndex) {
		tr = $('<tr></tr>', {
			'class': 'trTimeChecker subtask',
			idtype: 'trTimeChecker',
			dayid: dayId,
			taskindex: taskIndex,
			subtaskIndex: subtaskIndex,
			id: prefix + dayId + '_' + 'trTimeChecker' + taskIndex + '-' + subtaskIndex
		})
			.append(tdStartTime, tdTime, tdComment, tdCloseSubtask);

	} else {
		tr = $('<tr></tr>', {
			'class': 'trTimeChecker task',
			idtype: 'trTimeChecker',
			dayid: dayId,
			subtaskcount: 1,
			taskindex: taskIndex,
			id: prefix + dayId + '_' + 'trTimeChecker' + taskIndex
		})
			.append(tdTask, tdStartTime, tdTime, tdComment, tdCloseSubtask, tdDeleteTask);
	}

	componentHandler.upgradeElement(buttonTimeStart.get(0));
	componentHandler.upgradeElement(buttonTimeStop.get(0));
	componentHandler.upgradeElement(buttonCloseSubtask.get(0));
	componentHandler.upgradeElement(buttonAddSubtask.get(0));
	componentHandler.upgradeElement(buttonDeleteTask.get(0));

	return tr;
}

function CreateHeaderRow(dayId, prefix) {

	var spanCreateTemplate = $('<span></span>')
	.css({
		paddingRight: '16px'
	})
	.append('Task');
	
	var iconCreateTemplate = $('<i class="material-icons">list</i>');

	var buttonIdCreateTemplate = prefix + dayId + '_' + 'buttonCreateTemplate';
	
	var buttonCreateTemplate = $('<button></button>', {
		'class': 'mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect',
		idtype: 'buttonCreateTemplate',
		id: buttonIdCreateTemplate
	})
	.css({
		marginBottom: '2px'
	})
	.append(iconCreateTemplate);
	
	var tooltipCreateTemplate = $('<div class="mdl-tooltip" for="' + buttonIdCreateTemplate + '">Создать шаблон</div>');	


	var tdTask = $('<td></td>', {
		colspan: 2
	}).append(spanCreateTemplate, buttonCreateTemplate, tooltipCreateTemplate);

	var divTitleTime = $('<div></div>')
	.append('Spent time <br>(hh:mm)');
	
	var iconToProperView = $('<i class="material-icons">done_all</i>');

	var buttonIdToProperView = prefix + dayId + '_' + 'buttonToProperView';
	
	var buttonToProperView = $('<button></button>', {
		'class': 'mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect',
		idtype: 'buttonToProperView',
		id: buttonIdToProperView
	})
	.append(iconToProperView);
	
	var tooltipToProperView = $('<div class="mdl-tooltip" for="' + buttonIdToProperView + '">Округлить время</div>');	
	
	var tdTime = $('<td></td>', {
	})
	.css({
		display: 'flex'
	})
	.append(divTitleTime, tooltipToProperView, buttonToProperView);

	var tdComment = $('<td></td>', {
		colspan: 2
	}).append('Subtask/comment');

	var tdDeleteSubtask = $('<td></td>', {
		'class': 'time'
	}).append('Delete<br>subtask');

	var tdDeleteTask = $('<td></td>', {
		'class': 'time'
	}).append('Delete<br>task');

	componentHandler.upgradeElement(buttonToProperView.get(0));
	componentHandler.upgradeElement(buttonCreateTemplate.get(0));
	
	return $('<tr></tr>', {
		'class': 'header',
		idtype: 'header',
		dayid: dayId,
		id: prefix + dayId + '_header'
	}).append(tdTask, tdTime, tdComment, tdDeleteSubtask, tdDeleteTask);
}

function CreateOtherRow(dayId, prefix) {

	var labelTask = $('<label></label>', {
		idtype: 'labelTask',
		id: dayId + '_other_labelTask'
	})
	.css({
		width: '220px'
	})
	.append('Other');

	var tdTask = $('<td></td>', {
		colspan: 2
	})
	.append(labelTask);

	var labelTime = $('<label></label>', {
		idtype: 'labelTime',
		id: dayId + '_other_labelTime'
	})
	.css({
		width: '70px'
	})
	.append(GetTimeForOtherLabel(dayId));

	var tdTime = $('<td></td>', {
		'class': 'subtaskTd'
	})
	.append(labelTime);

	var tdComment = $('<td></td>', {
		colspan: 4
	})
	.append('Time for this day left');

	return $('<tr></tr>', {
		'class': 'other',
		idtype: 'other',
		dayid: dayId,
		taskindex: 'other',
		id: prefix + dayId + '_other'
	})
	.append(tdTask, tdTime, tdComment);
}

/**
 * @return {string}
 */
function GetTimeForOtherLabel(dayId) {
	var prefix = GetCurrentMonthAndYearPrefix();
	var reportTime = $('#' + dayId).find('td.time').last().find('span.usualTime').text();

	var inputs = $('[idtype=inputTime][id^="' + prefix + dayId + '_"]').toArray();
	var regExp = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
	
	var times = inputs.map(
		function(input) {
			var time = $(input).val();
			if (!regExp.test(time)) {
				time = ToTime(time);
				if (!regExp.test(time)) {
					time = '00:00';
				}
			}
			
			return time;
		}
	);
	

	var result = times.reduce(function(sum, current) {
		return TCH_SumOfTime(sum, current);
	}, '00:00');

	return ToDecimal(TCH_DifferenceOfTime(reportTime, result));
}

function CheckRowsNumber(lastRowIndex, dayId) {
	var prefix = GetCurrentMonthAndYearPrefix();

	if (CheckIfAnyInputHasVal(dayId, prefix, lastRowIndex) && $('#' + prefix + dayId + '_' + 'trTimeChecker' + (lastRowIndex + 1)).length <= 0)
	{
		var selector = '#' + prefix + dayId + '_' + 'trTimeChecker' + lastRowIndex;
		var lastSubtaskIndex = +$(selector).attr('subtaskcount') - 1;
		if (lastSubtaskIndex != 0) {
			selector += '-' + lastSubtaskIndex;
		}
		$(selector).after(CreateTimeCheckerRow(dayId, prefix, ++lastRowIndex));
		//$(selector).after(CreateEmptyTimeCheckingRow(++lastRowIndex, dayId));
	} else {
		for (var i = 0; i < lastRowIndex; i++) {
			var currentRow = $('#' + prefix + dayId + '_' + 'trTimeChecker' + i);
			if (!currentRow) continue;

			if (!CheckIfAnyInputHasVal(dayId, prefix, i)) {
				ClearLocalStorageInputValueForRow(currentRow);
				localStorage.removeItem(prefix + dayId + '_' + i);
				
				$('[dayid=' + dayId + '][taskindex=' + i + ']').remove();
			}
		}
	}

	return lastRowIndex;
}

/**
 * @return {boolean}
 */
function CheckIfAnyInputHasVal(dayId, prefix, taskIndex) {
	var subtaskCount = $('#' + prefix + dayId + '_' + 'trTimeChecker' + taskIndex).attr('subtaskcount');

	var isAnyInputHasVal = ($('#' + prefix + dayId + '_' + 'inputTask' + taskIndex).val() != '');

	for (var i = 0; i < subtaskCount; i++) {
		var label = $('#' + prefix + dayId + '_' + 'startTime' + taskIndex + '-' + i);
		var labelText = label.text();
		isAnyInputHasVal = isAnyInputHasVal
			|| (labelText != '')
			|| ($('#' + prefix + dayId + '_' + 'inputComment' + taskIndex + '-' + i).val() != '')
			|| ($('#' + prefix + dayId + '_' + 'inputTime' + taskIndex + '-' + i).val() != '');
	}

	return isAnyInputHasVal;
}

function ClearLocalStorageInputValueForRow(row, shouldTaskBeCleared) {
	row.find('[idtype="inputTask"], [idtype="inputComment"], [idtype="inputTime"], [idtype="startTime"]')
	.each(
		function() {
			var self = $(this);
			if (self.attr('idtype') == 'inputTask' && shouldTaskBeCleared)
				self.val('');
			if (self.is('input')) {
				if (((self.attr('idtype') == 'inputTask') && shouldTaskBeCleared) || (self.attr('idtype') != 'inputTask')) {
					self.val('');
				}
			} else {
				self.text('');
			}
			var id = self.attr('id');
			localStorage.removeItem(id);
		}
	);
}

/**
 * @return {number}
 */
function RecountIds(dayId) {
	var rowsIndex = 0;
	var prefix = GetCurrentMonthAndYearPrefix();

	$('.task[idtype="trTimeChecker"][dayid=' + dayId + ']').each(
		function() {

			var row = $(this);
			var dayId = row.attr('dayid');

			row.find('[idtype]').each(function() {
				var item = $(this);
				var oldId = item.attr('id');
				var idType = item.attr('idtype');
				var id = prefix + dayId + '_' + idType + rowsIndex;
				if (item.parent().hasClass('subtaskTd')) {
					id += '-0';
				}
				item.attr('id', id);

				if ((item.is('input') || item.is('label'))&& localStorage[oldId] && oldId != id) {
					localStorage[id] = localStorage[oldId];
					localStorage.removeItem(oldId);
				}
			});

			var oldTaskIndex = row.attr('taskindex');
			var oldSubtaskCountId = prefix + dayId + '_' + oldTaskIndex;
			var newSubtaskCountId = prefix + dayId + '_' + rowsIndex;
			if (localStorage[oldSubtaskCountId] && oldSubtaskCountId != newSubtaskCountId) {
				localStorage[newSubtaskCountId] = localStorage[oldSubtaskCountId];
				localStorage.removeItem(oldSubtaskCountId);
			}

			row.attr('id', prefix + dayId + '_' + 'trTimeChecker' + rowsIndex);
			row.attr('taskindex', rowsIndex);
			var subtaskCount = $(this).attr('subtaskcount');
			for (var i = 1; i < subtaskCount; i++) {
				RecountIdsForSubtasksRows(+oldTaskIndex, dayId, +rowsIndex );
			}

			rowsIndex++;
		}
	);

	return --rowsIndex;
}

/**
 * @return {number}
 */
function RecountIdsForSubtasksRows(taskIndex, dayId, newTaskIndex) {
	var subtaskIndex = 0;
	var realIndex = (newTaskIndex === undefined) ? taskIndex : newTaskIndex;
	var prefix = GetCurrentMonthAndYearPrefix();

	$('[dayid=' + dayId + '][idtype=trTimeChecker][taskindex=' + taskIndex + ']').each(
		function() {
			$(this).find('.subtaskTd [idtype]').each(function() {
				var oldId = $(this).attr('id');
				var idType = $(this).attr('idtype');
				var id = prefix + dayId + '_' + idType + realIndex + '-' + subtaskIndex;
				$(this).attr('id', id);

				if ($(this).is('input') && localStorage[oldId] && oldId != id) {
					localStorage[id] = localStorage[oldId];
					localStorage.removeItem(oldId);
				}
			});

			$(this).attr('taskindex', realIndex);

			if ($(this).hasClass('subtask')) {
				$(this).attr('id', prefix + dayId + '_' + 'trTimeChecker' + realIndex + '-' + subtaskIndex);
				$(this).attr('subtaskindex', subtaskIndex);
			}

			subtaskIndex++;
		}
	);

	return subtaskIndex;
}

function ShiftSubtask(taskIndex, dayId, prefix) {
	var mainRow = $('#' + prefix + dayId + '_' + 'trTimeChecker' + taskIndex);
	var subtaskCount = mainRow.attr('subtaskcount');
	var previousRow = mainRow;

	ClearLocalStorageInputValueForRow(mainRow);

	for (var i = 1; i < subtaskCount; i++) {

		var currentRow = $('#' + prefix + dayId + '_' + 'trTimeChecker' + taskIndex + '-' + i);
		var previousSubtaskTds = previousRow.find('td.subtaskTd');
		currentRow.find('td.subtaskTd').each(function(index) {
			var previousInput = $(previousSubtaskTds[index]).children('input');
			var currentInput = $(this).children('input');
			var previousId = previousInput.attr('id');
			var currentId = currentInput.attr('id');

			previousInput.val(currentInput.val());

			if (localStorage[currentId] && previousId != currentId) {
				localStorage[previousId] = localStorage[currentId];
				localStorage.removeItem(currentId);
			} else {
				localStorage.removeItem(previousId);
			}

			//$(previousSubtaskTds[index]).children('input').val($(this).children('input').val());
		});

		previousRow = currentRow;
	}

	currentRow.remove();
}

function ToDecimal(time) {
	var regExp = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
	
	if (!(regExp.test(time) || regExp.test(time.substr(1))))
	{
		return 0;
	}
	
	var position = +time.indexOf(":");
	var hours = +time.substr(0, position);
	var minutes = +time.substr(position + 1);
	var decimaMinutes = +(+ minutes/60).toFixed(2);
	var decimalTime = +hours + decimaMinutes;	
	
	return decimalTime;
}

function ToTime(decimal) {
	var position1 = +decimal.indexOf(".");
	var position2 = +decimal.indexOf(",");
	if (position1 < 0 && position2 < 0) {
		if (Number.isInteger(+decimal)) {
			return TCH_Pad(decimal, 2) + ':00';
		} else {
			return '00:00';
		}			
	}
	
	var position = position1 >= 0 ? position1 : position2;
	var hours = +decimal.substr(0, position);
	var minutes = +decimal.substr(position + 1, 2);
	if (!(Number.isInteger(+hours) && Number.isInteger(+minutes) && minutes >= 0))
	{
		return '00:00';
	}
	var realMinutes = +(+minutes*60/100).toFixed();
	var realTime = TCH_Pad(hours, 2) + ':' + TCH_Pad(realMinutes, 2);
	
	return realTime;	
}

function RoundTimeForDay(dayId) {
	var prefix = GetCurrentMonthAndYearPrefix();
	var inputs = $('[idtype=inputTime][id^="' + prefix + dayId + '_"]').toArray();
	
	var regExp = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
	
	var times = inputs.map(
		function(input) {
			var time = $(input).val();
			if (regExp.test(time)) {
				time = ToDecimal(time);
			}
			
			return time;
		}
	);
	
	for (var i = 0; i < inputs.length; i++) {
		if (!times[i])
			continue;
		var value = (Math.round(+times[i] * 4) / 4).toFixed(2);
		if (value.substr(value.length - 2) == '00') {
			value = (+value).toFixed();
		}
		
		var input = inputs[i];		
		$(input).val(value);
		var id = $(input).attr('id');
		localStorage[id] = value;
	}
}


function CreateTemplateMenu(dayId) {
	/*<label class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect" for="checkbox-2">
	  <input type="checkbox" id="checkbox-2" class="mdl-checkbox__input">
	  <span class="mdl-checkbox__label">Checkbox</span>
	</label>
	
	$('.trTimeChecker[dayid="' + dayId + '"]').each(function() {
		
	});*/
}

$(document).ready ( function() {
	var prefix = GetCurrentMonthAndYearPrefix();
	
	var prefixIndex = prefix.indexOf('_');
	var prefixMonth = prefix.substr(0, prefixIndex);
	var prefixYear = prefix.substr(prefixIndex + 1, 4)

	var date = new Date();
	var month = date.getMonth() + 1;
	var year = date.getFullYear();
	
	var previous = new Date();
	previous.setDate(1);
	previous.setMonth(previous.getMonth()-1);
	
	var previousMonth = previous.getMonth() + 1;
	var previousYear = previous.getFullYear();

	if(prefix && !((year == prefixYear && month == prefixMonth) || (previousYear == prefixYear && previousMonth == prefixMonth))) {
		return;
	}	
	
	var rowsIndex = SetUpInitialState();
	
	$('.trTimeChecker, .other, .header').hide();

	if(!prefix) {
		CreateCurrentDayButton();
		var currentDayId = GetCurrentDayId();
		$('tr.intervalRow, tr[id], tr.dayoff').hide();
		$('#' + currentDayId).addClass('timesheetOpened');
		$('#' + currentDayId + ', [dayid=' + currentDayId + ']').show();
	}
	
	
	SetTableHeightForTime();
	
	$('.mdl-tooltip').each(function() {
		componentHandler.upgradeElement(this);	
	})

	$(document).on('input', '[idtype="inputTask"], [idtype="inputComment"], [idtype="inputTime"]',
		function()
		{
			localStorage[$(this).attr('id')] = $(this).val();

			var mainTr = $(this).parent().parent();
			var dayId = mainTr.attr('dayid');
			rowsIndex[prefix + dayId] = CheckRowsNumber(rowsIndex[prefix + dayId], dayId);
			rowsIndex[prefix + dayId] = RecountIds(dayId);
			if (rowsIndex[prefix + dayId]) {
				localStorage[prefix + dayId] = rowsIndex[prefix + dayId];
			} else {
				localStorage.removeItem(prefix + dayId);
			}

			$('#' + prefix + dayId + '_other_labelTime').text(GetTimeForOtherLabel(dayId));
			SetTableHeightForTime();
		}
	);

	$(document).on('click', '[idtype="buttonDeleteTask"]',
		function() {

			var mainTr = $(this).parent().parent();
			var dayId = mainTr.attr('dayid');
			var idType = mainTr.attr('idtype');
			var taskIndex = mainTr.attr('taskindex');

			$('.subtask[dayid=' + dayId + '][idtype=' + idType + '][taskindex=' + taskIndex + ']').each(function() {
			//$('.subtask[id^="' + dayId + '_' + idType + taskIndex + '"]').each(function() {
				ClearLocalStorageInputValueForRow($(this));
			}).remove();

			mainTr.children('td').first().attr('rowspan', 1);
			mainTr.children('td').last().attr('rowspan', 1);
			mainTr.attr('subtaskcount', 1);

			ClearLocalStorageInputValueForRow(mainTr);
			localStorage.removeItem(prefix + dayId + '_' + taskIndex);

			if (rowsIndex[prefix + dayId] == taskIndex) {
				SetTableHeightForTime();
				return;
			}

			mainTr.remove();

			//rowsIndex[prefix + dayId] = RecountIds(dayId);
			rowsIndex[prefix + dayId] = CheckRowsNumber(rowsIndex[prefix + dayId], dayId);
			rowsIndex[prefix + dayId] = RecountIds(dayId);
			if (rowsIndex[prefix + dayId]) {
				localStorage[prefix + dayId] = rowsIndex[prefix + dayId];
			} else {
				localStorage.removeItem(prefix + dayId);
			}

			$('#' + prefix + dayId + '_other_labelTime').text(GetTimeForOtherLabel(dayId));
			SetTableHeightForTime();
		}
	);

	$(document).on('click', '[idtype="buttonAddSubtask"]',
		function() {
			var tr = $(this).parent().parent();
			var dayId = tr.attr('dayid');
			var taskIndex = +tr.attr('taskindex');

			var mainRow = $('#' + prefix + dayId + '_' + 'trTimeChecker' + taskIndex);
			var newSubtaskIndex = +mainRow.attr('subtaskcount');
			tr.after(CreateTimeCheckerRow(dayId, prefix, taskIndex, newSubtaskIndex));
			//tr.after(CreateSubtaskRow(taskIndex, newSubtaskIndex, dayId));

			var subtaskCount = newSubtaskIndex + 1;

			mainRow.attr('subtaskcount', subtaskCount);
			mainRow.children('td').first().attr('rowspan', subtaskCount);
			mainRow.children('td').last().attr('rowspan', subtaskCount);
			localStorage[prefix + dayId + '_' + taskIndex] = subtaskCount;

			RecountIdsForSubtasksRows(taskIndex, dayId);

			SetTableHeightForTime();
		}
	);

	$(document).on('click', '[idtype="buttonCloseSubtask"]',
		function() {
			var currentRow = $(this).parent().parent();
			var dayId = currentRow.attr('dayid');
			var taskIndex = currentRow.attr('taskindex');

			var mainRow = $('#' + prefix + dayId + '_' + 'trTimeChecker' + taskIndex);

			currentRow.find('[idtype="inputComment"], [idtype="inputTime"]').val("");
			currentRow.find('[idtype="inputComment"], [idtype="inputTime"]').val("");
			//ClearLocalStorageInputValueForRow(currentRow);

			var subtaskCount = +mainRow.attr('subtaskcount');

			var otherLine = $('#' + prefix + dayId + '_other_labelTime');

			if (subtaskCount == 1) {
				rowsIndex[prefix + dayId] = CheckRowsNumber(rowsIndex[prefix + dayId], dayId);
				rowsIndex[prefix + dayId] = RecountIds(dayId);
				if (rowsIndex[prefix + dayId]) {
					localStorage[prefix + dayId] = rowsIndex[prefix + dayId];
				}

				otherLine.text(GetTimeForOtherLabel(dayId));
				SetTableHeightForTime();
				return;
			}

			if (currentRow.attr('id') == (prefix + dayId + '_' + 'trTimeChecker' + taskIndex)) {
				ShiftSubtask(taskIndex, dayId, prefix);
			} else {
				currentRow.remove();
			}

			var newSubtaskCount = subtaskCount - 1;

			mainRow.attr('subtaskcount', newSubtaskCount);
			mainRow.children('td').first().attr('rowspan', newSubtaskCount);
			mainRow.children('td').last().attr('rowspan', newSubtaskCount);
			localStorage[prefix + dayId + '_' + taskIndex] = newSubtaskCount;

			RecountIdsForSubtasksRows(+taskIndex, dayId);

			rowsIndex[prefix + dayId] = CheckRowsNumber(rowsIndex[prefix + dayId], dayId);
			rowsIndex[prefix + dayId] = RecountIds(dayId);
			if (rowsIndex[prefix + dayId]) {
				localStorage[prefix + dayId] = rowsIndex[prefix + dayId];
			} else {
				localStorage.removeItem(prefix + dayId);
			}

			otherLine.text(GetTimeForOtherLabel(dayId));
			SetTableHeightForTime();
		}
	);

	$(document).on('click', '[idtype="buttonTimeStart"]',
		function() {
			var currentDate = new Date();
			var time = currentDate.getHours() + ":" + currentDate.getMinutes();

			// TODO: add counting seconds ???

			var mainRow = $(this).parent().parent();
			mainRow.find('[idtype=startTime]').text(time);

			var dayId = mainRow.attr('dayid');
			var taskIndex = mainRow.attr('taskindex');
			var subtaskIndex = mainRow.attr('subtaskindex') ? mainRow.attr('subtaskindex') : 0;

			localStorage[prefix + dayId + '_' + 'startTime' + taskIndex + '-' + subtaskIndex] = time;

			$(this).hide();
			var stopId = '#' + $(this).attr('id').replace('Start', 'Stop');
			$(stopId).show();
			mainRow.addClass('inProgress');

			rowsIndex[prefix + dayId] = CheckRowsNumber(rowsIndex[prefix + dayId], dayId);
			rowsIndex[prefix + dayId] = RecountIds(dayId);
			if (rowsIndex[prefix + dayId]) {
				localStorage[prefix + dayId] = rowsIndex[prefix + dayId];
			} else {
				localStorage.removeItem(prefix + dayId);
			}

			SetTableHeightForTime();
		}
	);

	$(document).on('click', '[idtype="buttonTimeStop"]',
		function() {
			var currentDate = new Date();
			var time = currentDate.getHours() + ":" + currentDate.getMinutes(); // + "." + currentDate.getSeconds();

			var mainRow = $(this).parent().parent();
			var dayId = mainRow.attr('dayid');

			var taskIndex = mainRow.attr('taskindex');
			var subtaskIndex = mainRow.attr('subtaskindex') ? mainRow.attr('subtaskindex') : 0;

			var input = mainRow.find('[idtype=inputTime]');
			var startTime = mainRow.find('[idtype=startTime]');
			
			var regExp = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
			var currentTime = input.val();		
			if (!regExp.test(currentTime)) {
				currentTime = ToTime(currentTime);
				if (!regExp.test(currentTime)) {
					currentTime = '';
				}
			}
			
			var workedTime;			
			
			if (currentTime) {
				workedTime = TCH_SumOfTime(TCH_DifferenceOfTime(time, startTime.text()), currentTime);
			} else {
				workedTime = TCH_DifferenceOfTime(time, startTime.text());
			}
			workedTime = ToDecimal(workedTime);
			input.val(workedTime);
			localStorage[input.attr('id')] = workedTime;

			$(this).hide();
			var startId = '#' + $(this).attr('id').replace('Stop', 'Start');
			$(startId).show();
			mainRow.removeClass('inProgress');

			localStorage.removeItem(prefix + dayId + '_' + 'startTime' + taskIndex + '-' + subtaskIndex);
			startTime.text('');

			$('#' + prefix + dayId + '_other_labelTime').text(GetTimeForOtherLabel(dayId));

			rowsIndex[prefix + dayId] = CheckRowsNumber(rowsIndex[prefix + dayId], dayId);
			rowsIndex[prefix + dayId] = RecountIds(dayId);
			if (rowsIndex[prefix + dayId]) {
				localStorage[prefix + dayId] = rowsIndex[prefix + dayId];
			} else {
				localStorage.removeItem(prefix + dayId);
			}

			SetTableHeightForTime();
		}
	);

	$(document).on('click', 'tr[id]:not(.future):not(.trTimeChecker):not(.other):not(.header)',
		function (){
			var currentRow = $(this);
			var dayId = currentRow.attr('id');

			if (currentRow.next().is(':visible')) {
				$('[dayid=' + dayId + ']').hide();
				currentRow.removeClass('timesheetOpened');

			} else {
				$('[dayid=' + dayId + ']').show();
				currentRow.addClass('timesheetOpened');
			}

			SetTableHeightForTime();
		}
	);

	$(document).on('click', '#currentDayToggle',
		function (){
			$('button.resetButton').click();
			if ($(this).hasClass('mdl-button--accent')) {
				$(this).removeClass('mdl-button--raised mdl-button--accent');

				$('tr.intervalRow, tr.dayoff, tr[id]').not('.future').not('.trTimeChecker').not('.other').not('.header').show();
				$('.trTimeChecker').hide();
				$('.other').hide();
				$('.header').hide();

				var dayId = GetCurrentDayId();
				$('#' + dayId).first().removeClass('timesheetOpened');

			} else {
				$(this).addClass('mdl-button--raised mdl-button--accent');
				var dayId = GetCurrentDayId();

				$('tr.intervalRow, tr[id], tr.dayoff').hide();
				$('#' + dayId + ', [dayid=' + dayId + ']').show();

				$('tr[id]:not(.future):not(.trTimeChecker):not(.other):not(.header)').removeClass('timesheetOpened');
				$('#' + dayId).first().addClass('timesheetOpened');

			}
			
			SetTableHeightForTime();
		}
	);

	$(document).on('click', '.intervalRow, button.resetButton',
		function (){
			$('.trTimeChecker').hide();
			$('.other').hide();
			$('.header').hide();

			$('.timesheetOpened').removeClass('timesheetOpened');
		}
	);
	
	document.querySelectorAll('[idtype="buttonToProperView"]').forEach(function(item) {
		item.onclick = function(e) {
			var currentRow = $(this).parent().parent();
			var dayId = currentRow.attr('dayid');
			RoundTimeForDay(dayId);
			$('#' + prefix + dayId + '_other_labelTime').text(GetTimeForOtherLabel(dayId));
		};
	});
	
	document.querySelectorAll('[idtype="buttonCreateTemplate"]').forEach(function(item) {
		item.onclick = function(e) {
			var currentRow = $(this).parent().parent();
			var dayId = currentRow.attr('dayid');
			
			CreateTemplateMenu(dayId);
		};
	});

});