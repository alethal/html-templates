(function() {

	function getDirection (event) {
		var
			w = this.offsetWidth,
			h = this.offsetHeight,
			r = this.getBoundingClientRect(),
			l = window.pageXOffset || document.documentElement.scrollLeft,
			t = window.pageYOffset || document.documentElement.scrollTop,
			x = (event.pageX - (r.left + l) - (w / 2)) * (w > h ? (h / w) : 1),
			y = (event.pageY - (r.top + t) - (h / 2)) * (h > w ? (w / h) : 1),
			result = Math.round((((Math.atan2(y, x) * (180 / Math.PI)) + 180) / 90) + 3) % 4;
		return event.type.indexOf('touch') === 0 ? (result - 2 < 0 ? result + 2 : result - 2) : result;
	}

	function setClasses(event) {
		var
			enter = event && event.type && ['mouseover', 'mouseenter', 'touchstart'].indexOf(event.type) > -1,
			direction = event ? getDirection.bind(this)(event) : 0,
			dir = ['Top', 'Right', 'Bottom', 'Left'],
			pos = dir.length,
			pos2;

		while (pos--) {
			pos2 = 2;
			while (pos2--) {
				this.classList[pos === direction && !!pos2 === enter ? 'add' : 'remove']((!!pos2 ? 'enter' : 'leave') + dir[pos]);
			}
		}
	}

	var childListMutationObserver = new MutationObserver(function (mutations) {
		var pos = mutations.length,
			item,
			updateElements = [];

		while (pos--) {
			item = mutations[pos].target;
			if (typeof item.gridzySkinCardUpdate === 'undefined') {
				item.gridzySkinCardUpdate = true;
				updateElements.push(item);
			}
		}
		pos = updateElements.length;
		if (pos) {
			while (pos--) {
				delete updateElements[pos].gridzySkinCardUpdate;
			}
			update(updateElements);
		}
	});

	var childListObservations = [];
	function updateObservations(observe, unobserve) {
		var pos,
			element,
			removeIndex,
			active = !!childListObservations.length,
			update = false;

		pos = observe.length;
		while (pos--) {
			element = observe[pos];
			if (childListObservations.indexOf(element) === -1) {
				childListObservations.push(element);
				update = true;
			}
		}

		pos = unobserve.length;
		while (pos--) {
			element = unobserve[pos];
			removeIndex = childListObservations.indexOf(element);
			if (removeIndex > -1) {
				childListObservations.splice(removeIndex, 1);
				update = true;
			}
		}

		if (update) {
			if (active) {
				childListMutationObserver.disconnect();
			}
			pos = childListObservations.length;
			while (pos--) {
				childListMutationObserver.observe(childListObservations[pos], {
					childList: true
				});
			}
		}
	}

	function update(init, uninit) {
		var element,
			items,
			item,
			observe = [],
			unobserve = [],
			pos,
			pos2;

		pos = init.length;
		while (pos--) {
			element = init[pos];
			observe.push(element);
			items = element.children;
			pos2 = items.length;
			while (pos2--) {
				item = items[pos2];
				if (typeof item.gridzySkinCard === 'undefined') {
					item.addEventListener('mouseenter', setClasses);
					item.addEventListener('mouseleave', setClasses);
					item.addEventListener('touchstart', setClasses);
					item.addEventListener('touchend', setClasses);
					item.gridzySkinCard = true;
				}
			}
		}
		if (uninit) {
			pos = uninit.length;
			while (pos--) {
				item = uninit[pos];
				unobserve.push(item);
				items = element.children;
				pos2 = items.length;
				while (pos2--) {
					item = items[pos2];

					if (typeof item.gridzySkinCard !== 'undefined') {
						item.removeEventListener('mouseenter', setClasses);
						item.removeEventListener('mouseleave', setClasses);
						item.removeEventListener('touchstart', setClasses);
						item.removeEventListener('touchend', setClasses);

						delete item.gridzySkinCard;
					}
				}
			}
		}
		updateObservations(observe, unobserve);
	}

	var gridzySkinCardCount = 0;
	var gridzySkinCardLightCount = 0;

	var classMutationObserver = new MutationObserver(function (mutations) {
		var gridzySkinCard = document.getElementsByClassName('gridzySkinCard'),
			gridzySkinCardLength = gridzySkinCard.length,
			gridzySkinCardLight = document.getElementsByClassName('gridzySkinCardLight'),
			gridzySkinCardLightLength = gridzySkinCardLight.length,
			have,
			had,
			initElements = [],
			uninitElements = [];

		if (gridzySkinCardCount !== gridzySkinCardLength || gridzySkinCardLightCount !== gridzySkinCardLightLength) {
			gridzySkinCardCount = gridzySkinCardLength;
			gridzySkinCardLightCount = gridzySkinCardLightLength;
			var pos = mutations.length;
			while (pos--) {
				have = mutations[pos].target.classList.contains('gridzySkinCard') || mutations[pos].target.classList.contains('gridzySkinCardLight');
				had = typeof mutations[pos].oldValue === 'string' && mutations[pos].oldValue.indexOf('gridzySkinCard') > -1 && mutations[pos].oldValue.search(/(^|\s)gridzySkinCard(Light)?($|\s)/) > -1;

				if (have !== had) {
					if (have) {
						initElements.push(mutations[pos].target);
					} else {
						uninitElements.push(mutations[pos].target);
					}
				}
			}
			update(initElements, uninitElements);
		}
	});

	document.addEventListener('DOMContentLoaded', function() {
		update([].slice.call(document.querySelectorAll('.gridzySkinCard, .gridzySkinCardLight')), []);

		classMutationObserver.observe(document.body, {
			attributes: true,
			attributeFilter: ['class'],
			attributeOldValue: true,
			subtree: true
		});
	});
})();