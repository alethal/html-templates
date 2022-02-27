(function() {
	function createImageBlur(image) {
		var imageBlur = image.cloneNode(true);
		imageBlur.classList.remove('gridzyImage');
		imageBlur.classList.add('gridzyImageBlur');
		imageBlur.setAttribute('aria-hidden', 'true');
		image.gridzyImageBlur = imageBlur;
	}

	function insertImageBlur(image) {
		if (image.gridzyImageBlur) {
			image.parentNode.insertBefore(image.gridzyImageBlur, image.nextSibling);
		}
	}

	function removeImageBlur(image) {
		if (image.gridzyImageBlur && image.gridzyImageBlur.parentNode) {
			image.gridzyImageBlur.parentNode.removeChild(image.gridzyImageBlur);
		}
	}

	var attributeMutationObserver = new MutationObserver(function (mutations) {
		var pos = mutations.length,
			image;
		while (pos--) {
			image = mutations[pos].target;
			if (typeof image.gridzyImageBlur !== 'undefined') {
				removeImageBlur(image);
				createImageBlur(image);
				insertImageBlur(image);
			}
		}
	});


	var childListMutationObserver = new MutationObserver(function (mutations) {
		var pos = mutations.length,
			item,
			updateElements = [];

		while (pos--) {
			item = mutations[pos].target;
			if (typeof item.gridzySkinBlurUpdate === 'undefined') {
				item.gridzySkinBlurUpdate = true;
				updateElements.push(item);
			}
		}
		pos = updateElements.length;
		if (pos) {
			while (pos--) {
				delete updateElements[pos].gridzySkinBlurUpdate;
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
		var images,
			image,
			insert = [],
			item,
			remove = [],
			observe = [],
			unobserve = [],
			pos,
			pos2;

		pos = init.length;
		while (pos--) {
			item = init[pos];
			images = item.querySelectorAll('.gridzyImage');
			observe.push(item);
			pos2 = images.length;
			while (pos2--) {
				image = images[pos2];
				if (typeof image.gridzyImageBlur === 'undefined') {
					createImageBlur(image);
					attributeMutationObserver.observe(image, {
						attributes: true
					});
				}
				insert.push(image);
			}
		}
		if (uninit) {
			pos = uninit.length;
			while (pos--) {
				item = uninit[pos];
				unobserve.push(item);
				remove = remove.concat([].slice.call(item.querySelectorAll('.gridzyImageBlur')));
			}
		}
		pos = insert.length;
		while (pos--) {
			item = insert[pos];
			insertImageBlur(item);
		}
		pos = remove.length;
		while (pos--) {
			item = remove[pos];
			item.parentNode.removeChild(item);
		}
		updateObservations(observe, unobserve);
	}

	var gridzySkinBlurCount = 0;
	var gridzySkinBlurLightCount = 0;

	var classMutationObserver = new MutationObserver(function (mutations) {
		var gridzySkinBlur = document.getElementsByClassName('gridzySkinBlur'),
			gridzySkinBlurLength = gridzySkinBlur.length,
			gridzySkinBlurLight = document.getElementsByClassName('gridzySkinBlurLight'),
			gridzySkinBlurLightLength = gridzySkinBlurLight.length,
			have,
			had,
			initElements = [],
			uninitElements = [];

		if (gridzySkinBlurCount !== gridzySkinBlurLength || gridzySkinBlurLightCount !== gridzySkinBlurLightLength) {
			gridzySkinBlurCount = gridzySkinBlurLength;
			gridzySkinBlurLightCount = gridzySkinBlurLightLength;
			var pos = mutations.length;
			while (pos--) {
				have = mutations[pos].target.classList.contains('gridzySkinBlur') || mutations[pos].target.classList.contains('gridzySkinBlurLight');
				had = typeof mutations[pos].oldValue === 'string' && mutations[pos].oldValue.indexOf('gridzySkinBlur') > -1 && mutations[pos].oldValue.search(/(^|\s)gridzySkinBlur(Light)?($|\s)/) > -1;

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
		update([].slice.call(document.querySelectorAll('.gridzySkinBlur, .gridzySkinBlurLight')), []);

		classMutationObserver.observe(document.body, {
			attributes: true,
			attributeFilter: ['class'],
			attributeOldValue: true,
			subtree: true
		});
	});
})();