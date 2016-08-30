chrome.browserAction.onClicked.addListener
(
	function(tab) 
	{
		var newURL = "http://co-msk-app02/Personal";
		if (window.location) {
			chrome.tabs.create({ url: newURL });
		} else {
			window.open(newURL,'_self');
		}
	}
);