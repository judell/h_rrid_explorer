chrome.runtime.onMessage.addListener(
  function(request, sender, callback) {
//alert('request.action: ' + request.action);
	switch (request.action) {
	  case 'get_digipo_tags':
		var tags;
		try { tags = get_digipo_tags(); }
		catch (e) { alert(e); }
		callback(tags);
		break;
	  case 'get_digipo_claims':
		var claims;
		try { claims = get_digipo_claims(request.url); }
		catch (e) { alert(e); }
		callback(claims);
		break;
	  case 'receive_selection':
		var start = request.position_selector.start;
		var end = request.position_selector.end;
		var prefix = request.quote_selector.prefix;
		var quote = request.quote_selector.exact;
		var tab_url = request.tab_url;
		var doctitle = request.doctitle;
		selection = [quote, prefix, tab_url, doctitle];
		callback(selection);
		var new_tab_url = 
			chrome.extension.getURL('annotate.html')			+	 
				'?uri='			+ encodeURIComponent(tab_url)	+ 
				'&doctitle='	+ encodeURIComponent(doctitle)	+
				'&prefix='		+ encodeURIComponent(prefix)	+
				'&quote='		+ encodeURIComponent(quote)		+
				'&start='		+ encodeURIComponent(start)		+
				'&end='			+ encodeURIComponent(end)
				;
		chrome.tabs.create({ url: new_tab_url}, function(tab){
			// nothing to do here?
		});

		
		break;
	  default:
		alert('unknown action', request.action);
	}
  });


/*
chrome.contextMenus.create({
	title: "Explore RRIDs on this Page", 
	contexts:["page"],
	onclick: function() {
debugger;
	}
});
*/

chrome.contextMenus.create({
	title: "Explore RRIDs on this Page", 
	contexts:["page"],
	onclick: function() {
		chrome.tabs.query({active:true}, function(tabs) {
			var tab = tabs[0];
			chrome.tabs.executeScript(tab.id, {file:'lib.js'}, function() {
				var params = "var params = {url:'URL',doctitle:'DOCTITLE'};"
						 .replace('URL',tab.url)
						 .replace('DOCTITLE', tab.title);
				chrome.tabs.executeScript(tab.id, {code:params}, function() {
					chrome.tabs.executeScript(tab.id, {file: "explore.js"});
				});
			});				
		});
	 }
});





