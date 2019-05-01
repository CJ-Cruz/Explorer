# Explorer
###### An **HTML5** and **JavaScript** framework that allows you to create a Dungeon-Crawler on a webpage easily.

## Basically, you only have to:
### Create areas:
*And place any content per area in the area-content*
```html
<div class="area" id="start" up="top" down="" left="" right="">
  <div class="area-content">
    Starting Area - only way is Up
  </div>
</div>
<div class="area" id="top" up="" down="start" left="" right="">
  <div class="area-content">
    Press Down to go back
  </div>
</div>
```
### Setup Minimap
```html
<div id="minimap"></div>
```
### Import CSS and JS files
```html
<link rel="stylesheet" href="src/explorer.css">
<script src="src/explorer.js"></script>
```
### Activate Explorer
```html
<script>new Explorer();</script>
```
### Result:
![alt text](https://lh3.googleusercontent.com/UTDdVtl3ockd72dAIlJhnXhVLKxbAUoMXgus1Iyq205CCWFZSjdWKF6XejVhcWtYGeX7PWYi5uEZTVVKRneVNrryap_sN6C4FO5R3cEGr-yf3UUEJZlv6bFDRram8nxRdnrYqYGjXVxltidQTE5ZHmtVAAkyfOP9-ab0-1o5PRovnYxfFfiBsLr8s7VPcSIDX7sOoO8AoQPN9yAlHjpmJLbtdBnlI_z13rHBNmV9LefXInrdxxCTHvRcv1XTIxrtBAXC17e_YSAvnbJEA-Wfb6Z-vZG3hzugR8MJeR5BKfIiyIAEOq21jgFi8sM_ZJ6A_rkaT5y-mXoky_5-izD0JZhaR4ISjn6xVJZu2hzLD2UuuD4KtWe11ALUZpRYMNy6aJ0EUrGvIqFSkVf55jfZ4kXn-048wZTN5C1DtMkJUR30uFxnRjj7lozkmWhpw0g0vDTnMo8VYhHQMDtInf12oOfbvlWQTdp3NWXbLpBOcCQl4qVmoAQ7pZQ12wPBC15YtJPPQsInAX1YrtDGh-UfGNSl77iesbVYHS1ajrBCIG6RdPItZ81zDmGg-hAfB7dWf81cjbd1xUYZPxGQ1F_DDKLJukblNOL2w6we9czPKyvo7c_PB_XbQmQeDb9u1vZ19jR4pBmoP5UIY5X5ehUTqs9ggvgm2_w=w806-h608-no "Explorer Basic")
![alt text](https://lh3.googleusercontent.com/zYiGD8dGlQ4rshhdK7UUzx1ku62bxXGNVr2cqr84891YNF8UYbsJm1jXwGqoU-xyabmEWBODyB670tdjTQVvuaypcEvD-Suqff4t9gLFPWv6uZN0uov7rP3bwXbVFhX0u2lQ262kBVRvk8P-QbqfBmIogM2gANVH_c5lFbcY0OMoh90wYgx6PQipLZZq7Yo0j9U-Zo6uqrY7EAduu6VKZmSEbESfkbujHsOOSevT52uNxnadZe-OhofhaPFNPKGa1jfBqqo0zTZrw2182qvSO5DZtwWn5Zzif1jxjNYusFKGOeBIR4uW6Nv9KfesDW67u9Gxtoh2J3tXD5E57FA5WTJSdihGERT48qGNuwoBqflFgwsW4NaEJkbZ-s1THiAG4G6HAqZcEdpdfuM4BS5RlwTczpJhcyvbRTrVUYnMsUOk9KrpzNP04-yqPMD9rZo16Eup4VvClDxi7r6LMtqPZVCpbZWQQHBmRiorsJfnn8m5RwRbJRHlZTteSl7Y1-SAKb1X9lhJ_c88LYyMnqyRHQWNwwBSxy9eE9VJgOHeN9kme0WE6Vnf0mzsQk9_NDv50KSYUrvg7yIQq8StKT2JcwKt0ZZK3YsY7q2vIk7dhLvHVqJV0nxLPu-YYbHOiLnUTuGl9ZvuxqMsCh-ett7osQzcb6c9rlE=w806-h608-no "Explorer Basic 2")

## Other Features
### Embedding to Element
```html
<script>new Explorer(document.getElementById("explorer-div"));</script>
```
### Multiple Instances
```html
<script>
    new Explorer(document.getElementById("explorer-div"));
    new Explorer(document.getElementById("explorer-2-div"));
</script>
```
### Customizeable Areas
```html
<!--
	An area can be further customized with the following attributes:
		label - change the name appearing in the minimap.
		hidden - doesn't show arrows in viewport, and paths and nodes in minimap. If found, hidden attribute will be gone. Start area cannot be hidden.
		highlighted - has a different color appearing in the minimap.
		position - set the permanent position of an area. Affects both minimap and sliding animation. Must be x and y values separated by comma.
		static - doesn't follow the standard sliding animation from one area to another. The animation is based on the direction used. Good for teleporting.
-->
<div class="area" id="start" label="home" up="top" down="" left="" right="" highlighted static>
  <div class="area-content">
    Starting Area - only way is Up
  </div>
</div>
<div class="area" id="top" up="" down="start" left="" right="" hidden position="100,-100">
  <div class="area-content" style="background-color: powderblue">
    Press Down to go back
  </div>
</div>
```
### Links
```html
<div class="area" id="start" label="home" up="file-in-same-directory" down="https://google.com" left="" right="">
  <div class="area-content">
    Starting Area
  </div>
</div>
```
### Customizations and Methods
```javascript
let explorer = new Explorer(document.getElementById("explorer"), explorerObject);
explorer.allowMovement(false);
explorer.resetMap();
explorer.setLabel("start", "home");
explorer.setVariable(key, value);
explorer.setEvents(events);
explorer.setDraws(draws);
```
### Events
```javascript
let event = {
    "areaId":{
        /*
            The onenter and onleave event has 4 variables:
				variables - allows getting/setting a variable within an Explorer.
				areas - an object containing all areas in the element to which the Explorer is contained.
				currentArea - the current area where the Explorer is at. Not a shorthand of areas[currentID].
				currentID - the ID of the area the Explorer is currently at, before leaving or upon entering.
			
			Note: The difference between currentArea and areas[currentID] is that the currentArea is the viewport where children of the areas[currentID] are transferred to, and it does not have the attributes of the area element.
		*/
		"onenter": function(variables, areas, currentArea, currentID){
		    if(!variables["key"]){
				variables["key"] = true;//create/set the variable "key"
				explorer.allowMovement(false);//disable movement for map update before movement;
				setTimeout(function(){
					areas[currentID].removeAttribute("highlighted");//remove highlight from the area element
					explorer.setLabel("areaId", "");//rename minimap label back to original
					explorer.resetMap();//refresh the minimap for updates
					currentArea.content.innerText = "Picked up a key.";//perform changes to the area's content
					explorer.allowMovement(true);//enable movement.
				},500)
				
			}
		}
		"onleave": function(variables, areas, currentArea, currentID){
			//change the area's content again
			currentArea.content.innerText = "Bottom - you can go left only";
		}
    }
}
```
### Custom Minimap SVG Graphics
```javascript
let draws = {
    "drawExit":function(position, size){
	let circle = document.createElementNS(svgns,"circle");
		circle.setAttributeNS(null,"stroke", "blue");
		circle.setAttributeNS(null,"stroke-width", "1");
		circle.setAttributeNS(null,"fill", "blue");
		circle.setAttributeNS(null,"cx", position.x);
		circle.setAttributeNS(null,"cy", position.y); 
		circle.setAttributeNS(null,"r", size); 
		return circle;
	},
	"drawLine":function(start, end){
	let line = document.createElementNS(svgns,"line");
		line.setAttributeNS(null, "x1", start.x);
		line.setAttributeNS(null, "y1", start.y);
		line.setAttributeNS(null, "x2", end.x);
		line.setAttributeNS(null, "y2", end.y);
		line.style.stroke = "red";
		line.style.opacity = 1;
		return line;
	},
	"drawArrow":function(position, areaSize){/*position.t for theta*/
	let g = document.createElementNS(svgns,"g");
		let left = explorerObject.draws.drawLine(position, {"x":position.x+(areaSize/32),"y":position.y+(areaSize/32)})
		let right = explorerObject.draws.drawLine(position, {"x":position.x+(areaSize/32),"y":position.y-(areaSize/32)})
		g.appendChild(left);
		g.appendChild(right);
		g.setAttributeNS(null, "transform", "rotate("+(position.t*180/Math.PI)+" "+position.x+" "+position.y+")");  //rotate pointing to area node
		return g;
	},
	"drawArea":function(position, isHighlighted, areaSize, textSize, label){
	//border
		let circle = document.createElementNS(svgns,"circle");
		circle.setAttributeNS(null,"stroke", "black");
		circle.setAttributeNS(null,"stroke-width", "1");
		if(isHighlighted)
			circle.setAttributeNS(null,"fill", "orange");
		else
			circle.setAttributeNS(null,"fill", "wheat");
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
}
```
## Demo
### Checkout the demo included in the repo starting from demo 1.

## License
### Explorer is licensed under **MIT License**
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
##### Copyright (c) 2019 Christian Josh G. Cruz
