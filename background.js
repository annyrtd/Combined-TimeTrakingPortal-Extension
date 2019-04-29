chrome.browserAction.onClicked.addListener(
	function(tab) {
		//var newURL = "http://co-msk-app02/Personal";
		var newURL = "http://ruportal/Personal";
		if (window.location) {
			chrome.tabs.create({ url: newURL });
		} else {
			window.open(newURL,'_self');
		}
	}
);

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.contentScriptQuery == "queryGender") {
      var url = "http://morpher.ru/Demo.aspx?s=" +
              encodeURIComponent(request.employee);
      fetch(url)
          .then(response => response.text())
		  .then(text => {
			  return sendResponse(text);
		  })
          .catch(console.log)
      return true;  // Will respond asynchronously.
    }
  });
