class Explorer{
	
	constructor(targetElement = document.body, explorerObject = {"options":{"textSize":12, "areaSize":100, "areaDistance":100, "minimapExpiry": 2000}, "draws": {}, "events":{}}){
		
		let allowMovement = true;
		let areas = {};
		
		//gets child of targetElement with same ID
		[...targetElement.children].forEach(function(child){
			if(child.className == "area" && child.id != "")
				areas[child.id] = child;
		})
		
		if(!explorerObject.options)
			explorerObject.options = {};
		
		let previews = document.createElement("div");
		let overlapper = document.createElement("div");
		let m_map;
		let current_id = "start";
		let svgns = "http://www.w3.org/2000/svg";
		let m_view;
		let map;
		let resetMap;
		let discovered = {};
		let labels = {};
		let map_size = {"pos_x":0, "pos_y":0,"neg_x":0,"neg_y":0}
		let text_size = explorerObject.options.textSize?explorerObject.options.textSize:12;
		let area_size = explorerObject.options.areaSize?explorerObject.options.areaSize:100;
		let area_distance = explorerObject.options.areaDistance?explorerObject.options.areaDistance:100;
		let minimap_expiry = explorerObject.options.minimapExpiry?explorerObject.options.minimapExpiry:2000;
		let previews_fade;
		let previews_clear;
		let map_fade_out;
		let map_reset;
		let minimap_update;
		let mutation_update;
		let width_bounds;
		let height_bounds;
		let all_ids = [];
		let explorerDraws = explorerObject.draws?explorerObject.draws:{}
		let explorerVariables = {};
		let explorerEvents = explorerObject.events?explorerObject.events:{};
		let explorerId = targetElement.localName+(targetElement.id==""?"":("#"+targetElement.id))+(targetElement.className==""?"":("."+targetElement.className));
		
		this.resetMap;
		this.allowMovement = function(bool = true, delay=0){
			setTimeout(function(){allowMovement = bool},delay);
		};
		
		this.setLabel = function(areaId, label = undefined){
			
			if(areas[areaId])	//for areas
				areas[areaId].setAttribute("label", label);
			else	//for links
				labels[areaId] = label;
			
			
		};
		
		this.setVariable = function(id, value){
			explorerVariables[id] = value;
			if(explorerEvents[current_id])
				if(explorerEvents[current_id].onenter)
					explorerEvents[current_id].onenter(explorerVariables, areas, overlapper, current_id);
		};
		
		this.setEvents = function(events){
			Object.keys(events).forEach(function(id){

				if(id in explorerEvents){
					if("onenter" in events[id])
						explorerEvents[id].onenter = events[id].onenter;
					if("onleave" in events[id])
						explorerEvents[id].onleave = events[id].onleave;
				}
				else
					explorerEvents[id] = events[id];

			});
		};

		this.setDraws = function(draws){
			Object.keys(draws).forEach(function(id){
				explorerDraws[id] = draws[id];
			});
			resetMap();
		};

		//check for map
		[...targetElement.children].some(function(child){
			if(child.id == "minimap"){
				m_map = child;
				return true;
			}
			return false;
		})
		
		//if no map indicated, generate hidden minimap
		if(!m_map){
			m_map = document.createElement("div");
			m_map.id = "minimap";
			m_map.setAttribute("width", 0);
			m_map.setAttribute("height", 0);
		}
		
		if(Explorer.active.includes(explorerId)){
			throw("Explorer is already activated for "+explorerId);
		}
		Explorer.active.push(explorerId);
		
		//add tab index for focus
		targetElement.setAttribute("tabindex","-1")
		//set relative
		targetElement.style.position = "relative";
		
		//setup previous view aka "previews"
		previews.style.position = "absolute";
		previews.style.top = 0;
		previews.style.left = 0;
		previews.style.zIndex = -1;
		previews.style.width = targetElement.clientWidth//"100%";
		previews.style.height = targetElement.clientHeight//"100%";
		previews.style.margin = "0px";
		targetElement.appendChild(previews);
		
		//setup overlapper, the screen that replaces the previews
		overlapper.style.position = "absolute";
		overlapper.style.width = targetElement.clientWidth//"100%";
		overlapper.style.height = targetElement.clientHeight//"100%";
		overlapper.style.zIndex = 0;
		overlapper.style.top = 0;
		overlapper.style.left = 0;
		overlapper.style.margin = "0px";
		targetElement.appendChild(overlapper);
		
		//setup index area; select only within children of target Element
		overlapper.innerHTML = areas["start"].innerHTML;
		
		//consolidate all ids from html
		Object.keys(areas).forEach(function(id){
				all_ids.push(id);
		})
		
		//check if id is url
		let checkURL = function(id){
			
			if(all_ids.includes(id))
				return false;
			
			return id.match("^((https?|ftp|smtp):\/\/)?(www.)?[a-zA-Z0-9#%-]+\.[a-z]+(\/[a-zA-Z0-9#%-]+\/?)*$")? true: false;
		}
		
		//gets the target point in linear path from source to target; can also get the theta
		let getPathToTarget = function(source, target, distance_from_target, no_initial){
		
			//compute theta
			let t = Math.atan2(source.y-target.y, source.x-target.x);
			return {"x": (no_initial?0:target.x) + (Math.cos(t)*distance_from_target), "y": (no_initial?0:target.y) + (Math.sin(t)*distance_from_target), "t":t};
		
		}
		
		//perform minimap and sliding direction computations
		{
			
			resetMap = function(){
				
				discovered = {};
				let map_width;
				let map_height;
				
				//check width and height
				if(!m_map.getAttribute("width")){
					m_map.setAttribute("width", 200);	//default
				}
				m_map.style.width = m_map.getAttribute("width");
				if(!m_map.getAttribute("height")){
					m_map.setAttribute("height", 200);	//default
				}
				m_map.style.height = m_map.getAttribute("height");
				
				map_width = parseInt(m_map.getAttribute("width"))/2;
				map_height = parseInt(m_map.getAttribute("height"))/2;
				width_bounds = map_width-(area_size);
				height_bounds = map_height-(area_size);
				
				//generate minimap viewport
				if(!m_view)
					m_view = document.createElement("div");
				
				//append viewport
				m_view.style.position = "relative";
				m_view.style.width = "100%";
				m_view.style.height = "100%";
				m_map.appendChild(m_view);
				
				if(!map)
					map = document.createElementNS(svgns,"svg");
				
				//delete all svg child elements
				[...map.children].forEach(function(child){
					child.remove();
				});
				
				//append map svg
				m_view.appendChild(map);
				map.style.webkitTransitionDuration = "0.3s";
				map.style.transitionDuration = "0.3s";
				map.style.display = "block";
				map.style.position = "absolute";
				
				//find areas using BFS
				discovered = {"start":{"position":{"x":0, "y":0}, "label":areas["start"].getAttribute("label")}};
				//perform BFS to find entire paths
				{
					//start on start area
					let queue = [areas["start"]];
					let discoverArea = function(target, direction, source_position, is_link, is_hidden){
						
						//use custom position of target instead
						if(!is_link && areas[target].hasAttribute("position")){
							
							let pos_string = areas[target].getAttribute("position");
							
							if(pos_string.trim()=="")
								return;
							
							if(!pos_string.includes(","))
								throw("Error. Invalid Position for Area \""+target+"\".");
							
							let tok = pos_string.split(",");
							let custom_x = parseFloat(tok[0].trim());
							let custom_y = parseFloat(tok[1].trim());
							
							//update max size
							if(map_size.pos_x < custom_x)
								map_size.pos_x = custom_x;
							if(map_size.pos_y < custom_y)
								map_size.pos_y = custom_y;
							if(map_size.neg_x > custom_x)
								map_size.neg_x = custom_x;
							if(map_size.neg_y > custom_y)
								map_size.neg_y = custom_y;
							
							discovered[target] = {"position":{"x":custom_x, "y":custom_y}, "label":areas[target].getAttribute("label"), "hidden":is_hidden}
						
						}
						else{
							//define position based on direction
							let pos_delta = {"x":0,"y":0}
							switch(direction){
								case "up": pos_delta.y -= area_distance;
									break;
								case "down": pos_delta.y += area_distance;
									break;
								case "left": pos_delta.x -= area_distance;
									break;
								case "right": pos_delta.x += area_distance;
									break;
							}
							//update max size
							if(map_size.pos_x < source_position.x+pos_delta.x)
								map_size.pos_x = source_position.x+pos_delta.x;
							if(map_size.pos_y < source_position.y+pos_delta.y)
								map_size.pos_y = source_position.y+pos_delta.y;
							if(map_size.neg_x > source_position.x+pos_delta.x)
								map_size.neg_x = source_position.x+pos_delta.x;
							if(map_size.neg_y > source_position.y+pos_delta.y)
								map_size.neg_y = source_position.y+pos_delta.y;
							
							if(is_link)
								discovered[target] = {"position":{"x":source_position.x+pos_delta.x, "y":source_position.y+pos_delta.y}, "label":labels[target], "up":null, "down":null, "left":null, "right":null, "hidden":is_hidden}
							else
								discovered[target] = {"position":{"x":source_position.x+pos_delta.x, "y":source_position.y+pos_delta.y}, "label":areas[target].getAttribute("label"), "up":null, "down":null, "left":null, "right":null, "hidden":is_hidden}
						
						}
						
						if(!is_link)
							queue.push(areas[target])
					
					}
					
					let checkDirection = function(v, direction){
						
						let dir_id = v.getAttribute(direction);
						if(dir_id){
							
							let is_link = checkURL(dir_id);
							let is_hidden;
							try{
								is_hidden = is_link?false:areas[dir_id].hasAttribute("hidden");
							}catch(exception){
								throw("Error. Invalid ID \""+dir_id+"\" used on \""+direction+"\" for Area \""+v.id+"\"");
							}
							if(is_link || !is_hidden)	//link or not hidden
								discovered[v.id][direction] = dir_id;
							if(!(dir_id in discovered))
								discoverArea(dir_id, direction, discovered[v.id].position, is_link, is_hidden);
						}
						
					}
					
					while(queue.length > 0){
						let v = queue.splice(0,1)[0];
						//check all edges
						{
							//check up
							checkDirection(v, "up");
							//check down
							checkDirection(v, "down");
							//check left
							checkDirection(v, "left");
							//check right
							checkDirection(v, "right");
						}
					}
				}
				
				//set max bounds of minimap svg
				map.setAttribute("height",""+(area_size*2+(map_size.pos_y-map_size.neg_y)));
				map.setAttribute("width",""+(area_size*2+(map_size.pos_x-map_size.neg_x)));
				
				let normalizePosition = function(position){
					return {"x": area_size-map_size.neg_x+position.x+area_size/4, "y":area_size-map_size.neg_y+position.y+area_size/4}
				}
				
				//consolidate movement markers
				let move_markers = [];
				
				//draw lines and arrow heads
				Object.keys(discovered).forEach(function(id){
					
					if(discovered[id].hidden)
						return;
					
					//setup position
					let pos = normalizePosition(discovered[id].position);
					
					//draws the exit graphic
					let generatePoint = "drawExit" in explorerDraws?explorerDraws.drawExit:function(position, size){
						//point
						let circle = document.createElementNS(svgns,"circle");
						circle.setAttributeNS(null,"stroke", "black");
						circle.setAttributeNS(null,"stroke-width", "1");
						circle.setAttributeNS(null,"fill", "black");
						circle.setAttributeNS(null,"cx", position.x);
						circle.setAttributeNS(null,"cy", position.y); 
						circle.setAttributeNS(null,"r", size); 
						return circle;
					}
					
					//draws the line graphic
					let generateLine = "drawLine" in explorerDraws?explorerDraws.drawLine:function(start,end){
						let line = document.createElementNS(svgns,"line");
						line.setAttributeNS(null, "x1", start.x);
						line.setAttributeNS(null, "y1", start.y);
						line.setAttributeNS(null, "x2", end.x);
						line.setAttributeNS(null, "y2", end.y);
						line.style.stroke = "black";
						line.style.opacity = 0.5;
						return line;
					}
					
					//generates the arrow graphic
					let generateArrowHead = "drawArrow" in explorerDraws?explorerDraws.drawArrow:function(end_position, areaSize){
						
						let g = document.createElementNS(svgns,"g");
						let left = generateLine(end_position, {"x":end_position.x+(areaSize/16),"y":end_position.y+(areaSize/16)})
						let right = generateLine(end_position, {"x":end_position.x+(areaSize/16),"y":end_position.y-(areaSize/16)})
						g.appendChild(left);
						g.appendChild(right);
						g.setAttributeNS(null, "transform", "rotate("+(end_position.t*180/Math.PI)+" "+end_position.x+" "+end_position.y+")");
						return g;
						
					}
					
					let makePaths = function(target_id, direction){
						
						//check if hidden
						if(discovered[target_id].hidden)
							return;
						
						//setup line
						let target_pos = normalizePosition(discovered[target_id].position); //target actual position
						let start = {};
						switch(direction){
							case "up":
								start.x = pos.x;
								start.y = pos.y - area_size/4;
								break;
							case "down":
								start.x = pos.x;
								start.y = pos.y + area_size/4;
								break;
							case "left":
								start.x = pos.x - area_size/4;
								start.y = pos.y;
								break;
							case "right":
								start.x = pos.x + area_size/4;
								start.y = pos.y;
								break;
						}
						let end = getPathToTarget(start, target_pos, (area_size/3.5));
						//line
						move_markers.push(generatePoint(start, area_size/32))
						map.appendChild(generateLine(start, end));
						//arrowhead
						map.appendChild(generateArrowHead(end, area_size));
					}
					
					//paths
					if(discovered[id].up){
						makePaths(discovered[id].up, "up")
					}
					if(discovered[id].down){
						makePaths(discovered[id].down, "down")
					}
					if(discovered[id].left){
						makePaths(discovered[id].left, "left")
					}
					if(discovered[id].right){
						makePaths(discovered[id].right, "right")
					}
				
					
				});
				
				//draw names and borders
				Object.keys(discovered).forEach(function(id){
					
					if(discovered[id].hidden)
						return;
					
					//setup position
					let pos = normalizePosition(discovered[id].position);
					
					let drawNode = "drawArea" in explorerDraws?explorerDraws.drawArea:function(position, isHighlighted, areaSize, textSize, label){
					
						//border
						let circle = document.createElementNS(svgns,"circle");
						circle.setAttributeNS(null,"stroke", "black");
						circle.setAttributeNS(null,"stroke-width", "1");
						if(isHighlighted)
							circle.setAttributeNS(null,"fill", "yellow");
						else
							circle.setAttributeNS(null,"fill", "white");
						circle.setAttributeNS(null,"cx", position.x);
						circle.setAttributeNS(null,"cy", position.y); 
						circle.setAttributeNS(null,"r", areaSize/4); 
						
						//text
						let text = document.createElementNS(svgns,"text");
						text.setAttributeNS(null,"font-size", textSize);
						text.setAttributeNS(null,"text-anchor", "middle"); //alignment-baseline
						text.setAttributeNS(null,"alignment-baseline", "middle"); //
						text.setAttributeNS(null,"x", position.x); //-map_size.neg_x
						text.setAttributeNS(null,"y", position.y); 
						text.appendChild(document.createTextNode(label));
						
						return [circle,text];
						
					}
					
					let is_highlighted = !checkURL(id) && areas[id].hasAttribute("highlighted");
						
					drawNode(pos, is_highlighted, area_size, text_size, discovered[id].label?discovered[id].label:id).forEach(function(node){
						map.appendChild(node);
					});
					
				});

				//draw move markers
				move_markers.forEach(function(e){
					map.appendChild(e);
				});
				
			
			}
			
			resetMap();
			
			this.resetMap = function(){
				clearTimeout(map_reset);
				map_reset=setTimeout(function(){resetMap();},0);
			};
			
			//set start as focus
			map.style.left = width_bounds + map_size.neg_x  - discovered["start"].position.x-area_size/4;
			map.style.top = height_bounds + map_size.neg_y - discovered["start"].position.y-area_size/4;
			
		}
		
		let performSlide = function(anchor){
			overlapper.style.top = 0;
			overlapper.style.left = 0;
			previews_fade = setTimeout(function(){	//immediately hide previews pane
				previews.style.display = "none";
				previews_clear = setTimeout(function(){
					transferChildren(previews);
				},50);
			}, 300)
		}
		
		let resetTransition = function(anchor){
			overlapper.style.display = "block";
			overlapper.style.webkitTransitionDuration = "0.3s";
			overlapper.style.transitionDuration = "0.3s";
			setTimeout(function(){performSlide(anchor)},0);
		}
		
		let updateMinimap = function(target_id){
			m_map.style.opacity = 0.5;
			m_map.style.display = "block";
			clearTimeout(map_fade_out);
			clearTimeout(map_reset);
			clearInterval(minimap_update);
			//update minimap location
			map.style.left = width_bounds + map_size.neg_x - discovered[target_id].position.x-area_size/4;
			map.style.top = height_bounds + map_size.neg_y - discovered[target_id].position.y-area_size/4;
			minimap_update = setTimeout(function(){
				
				//hidden minimap
				map_fade_out = setTimeout(function(){
					m_map.style.opacity = 0;
					map_reset = setTimeout(function(){	//for immediate 0.5 opacity upon movement
						m_map.style.opacity = 0.5;
						m_map.style.display = "none";
					}, 500)
				}, minimap_expiry)
				
				updateArrows();
				
			}, 0);
		}
		
		let transferChildren = function(target, source = undefined, clone = false){
			
			[...target.childNodes].forEach(function(e){
				e.remove();
			});
			if(source){
				[...source.childNodes].forEach(function(e){
					if(clone)
						target.appendChild(e.cloneNode(true));
					else
						target.appendChild(e);
				});
			}
			
		}
		
		let jump = function(direction){
			
			if(!allowMovement)	//prevent jump if not allowed
				return;
			
			let current = areas[current_id]
			let target_id = current.getAttribute(direction);
			
			if(!target_id)
				return;
			
			//prevent removal of previews
			clearTimeout(previews_fade);
			clearTimeout(previews_clear);
			
			
			//trigger onleave of current id
			if(explorerEvents[current_id])
				if(explorerEvents[current_id].onleave)
					explorerEvents[current_id].onleave(explorerVariables, areas, overlapper, current_id);
			
			//show first current view being overlapped
			previews.style.display = "block";
			//previews.innerHTML = current.innerHTML;
			transferChildren(previews, overlapper, true);
			
			//copy all content/changes to the original copy of area
			//current.innerHTML = overlapper.innerHTML;
			transferChildren(current, overlapper);
			
			//setup animation
			overlapper.content = undefined;
			overlapper.style.webkitTransitionDuration = "0s";
			overlapper.style.transitionDuration = "0s";
			//overlapper.innerHTML = document.getElementById(target_id).innerHTML;
			//document.getElementById(target_id).innerHTML = "";
			
			//check if link
			if(all_ids.includes(target_id)){
				transferChildren(overlapper, areas[target_id]);
				transferChildren(areas[target_id]); //clear area
			}else{
				transferChildren(overlapper);//clear overlapper to prepare for link
				let d = document.createElement("div");
				d.className = "area-content";
				d.style.display = "flex";
				d.style.alignItems = "center";
				let c = document.createElement("div");
				c.style.width = "100%";
				c.style.textAlign = "center";
				let h = document.createElement("h1");
				h.innerText = target_id;
				c.appendChild(h);
				d.appendChild(c);
				overlapper.appendChild(d);
			}

			//point overlapper.container to the container element
			[...overlapper.children].some(function(elem){
				if(elem.className == "area-content"){
					overlapper.content = elem;
					return true;
				}
				return false;
			})
			
			//perform sliding based on direction used
			if(all_ids.includes(target_id) && areas[target_id].hasAttribute("static")){
				
				switch(direction){
					
					case "up":
						overlapper.style.top = -targetElement.clientHeight;
						break;
					case "down":
						overlapper.style.top = targetElement.clientHeight;
						break;
					case "left":
						overlapper.style.left = -targetElement.clientWidth;
						break;
					case "right":
						overlapper.style.left = targetElement.clientWidth;
						break;
					
				}
				
			}else{//perform sliding based on actual direction
				//animate sliding of overlapper
				let source = discovered[current_id].position
				let target = discovered[target_id].position
				let position = getPathToTarget(target, source, Math.sqrt((targetElement.clientHeight**2) + targetElement.clientWidth**2), true)	//pythagorean theorem
				overlapper.style.top = position.y;
				overlapper.style.left = position.x;
			}
			setTimeout(function(){resetTransition()}, 0);
			current_id = target_id;
			
			updateMinimap(target_id);
			
			if(!all_ids.includes(target_id)){
				setTimeout(function(){
					window.location = target_id;	//open link
				}, 500);
				return;
			}
			
			//trigger onenter of target id
			if(explorerEvents[target_id])
				if(explorerEvents[target_id].onenter)
					explorerEvents[target_id].onenter(explorerVariables, areas, overlapper, current_id);
			
			//unhide if hidden
			if(discovered[target_id].hidden)
			setTimeout(function(){
				areas[target_id].removeAttribute("hidden");
			},300);
		}
		
		//set navigation arrows
		let setArrows = function(){
		
			let arrow_up = document.createElement("span");
			arrow_up.id = explorerId+"-arrow-up";
			arrow_up.className = "arrow-up";
			arrow_up.onclick = function(){ jump("up"); }
			targetElement.appendChild(arrow_up);
			
			let arrow_down = document.createElement("span");
			arrow_down.id = explorerId+"-arrow-down";
			arrow_down.className = "arrow-down";
			arrow_down.onclick = function(){ jump("down"); }
			targetElement.appendChild(arrow_down);
			
			let arrow_left = document.createElement("span");
			arrow_left.id = explorerId+"-arrow-left";
			arrow_left.className = "arrow-left";
			arrow_left.onclick = function(){ jump("left"); }
			targetElement.appendChild(arrow_left);
			
			let arrow_right = document.createElement("span");
			arrow_right.id = explorerId+"-arrow-right";
			arrow_right.className = "arrow-right";
			arrow_right.onclick = function(){ jump("right"); }
			targetElement.appendChild(arrow_right);
			
		}
		
		setArrows();
		
		let updateArrows = function(){
		
			let elem = areas[current_id];
			if(!elem)
				return;
			
			let up = document.getElementById(explorerId+"-arrow-up");
			let down = document.getElementById(explorerId+"-arrow-down");
			let left = document.getElementById(explorerId+"-arrow-left");
			let right = document.getElementById(explorerId+"-arrow-right");
			
			//check for attributes
			if(elem.getAttribute("up") && ( checkURL(elem.getAttribute("up")) || !areas[elem.getAttribute("up")].hasAttribute("hidden")))
				up.style.display = "block";
			else
				up.style.display = "none";
			if(elem.getAttribute("down") && ( checkURL(elem.getAttribute("down")) || !areas[elem.getAttribute("down")].hasAttribute("hidden")))
				down.style.display = "block";
			else
				down.style.display = "none";
			if(elem.getAttribute("left") && ( checkURL(elem.getAttribute("left")) || !areas[elem.getAttribute("left")].hasAttribute("hidden")))
				left.style.display = "block";
			else
				left.style.display = "none";
			if(elem.getAttribute("right") && ( checkURL(elem.getAttribute("right")) || !areas[elem.getAttribute("right")].hasAttribute("hidden")))
				right.style.display = "block";
			else
				right.style.display = "none";
			
			//reset all arrow's transition speed;
			up.removeAttribute("pulsing");
			down.removeAttribute("pulsing");
			left.removeAttribute("pulsing");
			right.removeAttribute("pulsing");
			setTimeout(function(){
				
				up.setAttribute("pulsing","");
				down.setAttribute("pulsing","");
				left.setAttribute("pulsing","");
				right.setAttribute("pulsing","");
			
			}, 0);
		
		}
		
		let keyControls = function(){
			
			switch(event.code){
				case "ArrowUp":	//Up
					jump("up")
					break;
				case "ArrowDown":	//Down
					jump("down")
					break;
				case "ArrowLeft":	//Left
					jump("left")
					break;
				case "ArrowRight":	//Right
					jump("right")
					break;
			}
			
		}
		
		//setup key controls on focus only
		targetElement.addEventListener("focusin", function(){
			if(event.target.type == "textarea")
				document.onkeydown = undefined;
			else
				document.onkeydown = keyControls;
		});
		targetElement.addEventListener("focusout", function(){
			document.onkeydown = undefined;
		});
		
		//readjust on window resize
		window.onresize = function(){
			
			//resize overlapper based on targetElement's size
			overlapper.setAttribute("width", targetElement.clientWidth);
			overlapper.setAttribute("height", targetElement.clientHeight);
			overlapper.style.width = targetElement.clientWidth;
			overlapper.style.height = targetElement.clientHeight;
			
			//resize previews based on targetElement's size
			previews.setAttribute("width", targetElement.clientWidth);
			previews.setAttribute("height", targetElement.clientHeight);
			previews.style.width = targetElement.clientWidth;
			previews.style.height = targetElement.clientHeight;
			
		}
		
		
		//setup observers for changes in paths
		let observerCallback = function (mutationList, observer) {
			mutationList.some((mutation) => {
				if(mutation.type === "attributes") {
					if(mutation.attributeName == "up" || mutation.attributeName == "down" || mutation.attributeName == "left" || mutation.attributeName == "right" || mutation.attributeName == "hidden"){
						if(resetMap)
							resetMap();
						//update changes;
						updateMinimap(current_id);
						return true;
					}
				}
				return false;
			});
		};
		
		let observer = new MutationObserver(observerCallback);
		let observerOptions = {
			childList: true,
			attributes: true,
			subtree: true
		};
		Object.keys(areas).forEach(function(id){
			observer.observe(areas[id], observerOptions);
		})
		
		//http://javascriptkit.com/javatutors/touchevents2.shtml
		let swipe = function(el){
			
			let touchsurface = el,
			swipedir,
			startX,
			startY,
			dist,
			distX,
			distY,
			threshold = 150, //required min distance traveled to be considered swipe
			restraint = 100, // maximum distance allowed at the same time in perpendicular direction
			allowedTime = 300, // maximum time allowed to travel that distance
			elapsedTime,
			startTime;
			
			touchsurface.addEventListener('touchstart', function(e){
				var touchobj = e.changedTouches[0]
				swipedir = 'none'
				dist = 0
				startX = touchobj.pageX
				startY = touchobj.pageY
				startTime = new Date().getTime() // record time when finger first makes contact with surface
				e.preventDefault()
			}, false)
		  
			touchsurface.addEventListener('touchmove', function(e){
				e.preventDefault() // prevent scrolling when inside DIV
			}, false)
		  
			touchsurface.addEventListener('touchend', function(e){
				var touchobj = e.changedTouches[0]
				distX = touchobj.pageX - startX // get horizontal dist traveled by finger while in contact with surface
				distY = touchobj.pageY - startY // get vertical dist traveled by finger while in contact with surface
				elapsedTime = new Date().getTime() - startTime // get time elapsed
				console.log(distX, distY)
				if (elapsedTime <= allowedTime){ // first condition for awipe met
					if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint){ // 2nd condition for horizontal swipe met
						swipedir = (distX < 0)? 'right' : 'left' // if dist traveled is negative, it indicates left swipe
					}
					else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint){ // 2nd condition for vertical swipe met
						swipedir = (distY < 0)? 'down' : 'up' // if dist traveled is negative, it indicates up swipe
					}
				}
				console.log(swipedir);
				jump(swipedir)
				e.preventDefault()
			}, false);
			
		}
		
		//initialize key controls
		document.onkeydown = keyControls;
		//initialize swipe controls
		swipe(targetElement);
		//setup nav helpers
		updateArrows();
		
	}
	
	static active = [];
	
}
