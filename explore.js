var rrid_regex = /RRID:[^\s\)]+/;

var nodes = textNodesUnder(document.body);

console.log(nodes.length);

var rrid_nodes = nodes.filter(function(n) { return has_rrid(n) });

var rrid_texts = rrid_nodes.map(function(n) { return n.textContent.match(rrid_regex)[0]; });

var rrid_totals = {};

for (var i=0; i<rrid_texts.length; i++) {
	var rrid_text = rrid_texts[i];
	rrid_totals[rrid_text] = 0;
}

for (var i=0; i<rrid_nodes.length; i++) {
	var node = rrid_nodes[i];
	var match_length = node.textContent.match(rrid_regex)[0].length;
	var start = node.textContent.indexOf('RRID');
	var split_1 = node.splitText(start);
	var split_2 = split_1.splitText(match_length);
	var rrid_text = split_1.textContent;
	console.log(rrid_text);
	var wrapper = document.createElement('span');
	wrapper.className = 'rrid';
	wrapper.id = rrid_text;
	wrapper.style['background-color'] = '#fdfd92'
	wrap(split_1, wrapper);
}

var promises = make_tag_search_promises();

Promise.all(promises)
	.then(function(){
			Object.keys(rrid_totals).forEach(function (rrid_text) {
				var total = rrid_totals[rrid_text];
				var rrid_node = document.getElementById(rrid_text);
				if ( total == 0 ) {
					rrid_node.style['background-color'] = '#ea8888';
				}
				else {
					rrid_node.style['background-color'] = '#fdfd92'
					var wrapper = document.createElement('a');
					wrapper.title = 'view other papers that use ' + rrid_text;
					wrapper.href = 'https://hypothes.is/search?q=tag:' + rrid_text;
					wrapper.target = '_new';
					wrap(rrid_node, wrapper);
				}
			});
		})
		.catch(function(err){
			console.log(err);
		});

function make_tag_search_promises() {
	var promises = [];
	for (var i=0; i<rrid_texts.length; i++) {
		  var rrid_text = rrid_texts[i];
		  var options = {
			method: 'GET',
			url: 'https://hypothes.is/api/search?limit=200&tag=' + rrid_text
		  };
		  promises.push(
			makeRequest(options)
			  .then(function(data) {
					var obj = JSON.parse(data);
					var total = obj.total;
					if ( total > 0 ) {
						var row = obj.rows[0];
						var tags = row.tags;
						for (var i=0; i<tags.length; i++) {
							var tag = tags[i];
							if (tag.startsWith('RRID:')) {
								rrid_totals[tag] = total;
							}
						}
					}
			  })
		   );
	  }
	  return promises;
}

function wrap(el, wrapper) {
    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(el);
}


function textNodesUnder(el){
  var n, a=[], walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null,false);
  while(n=walk.nextNode()) a.push(n);
  return a;
}

function has_rrid(el) {
	return (el.textContent.match(rrid_regex));
}


