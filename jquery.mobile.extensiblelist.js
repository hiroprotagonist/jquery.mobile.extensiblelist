/*
 * jquery.mobile.extensiblelist v1
 *
 * Copyright (c) 2012, Volker Krebs
 * Dual licensed under the MIT and GPL Version 2 licenses.
 * 
 * Date: 2012-07-20
 * Revision: 1
 */
(function($) {
	$.widget('mobile.extensiblelist', $.mobile.widget, {
		options: {
			initSelector: ':jqmData(role=extensiblelist)',
			extlstPlaceholder: 'more',
			extlstSize: 5,
			extlstGrabspace: false,
			extlstAutoscroll: false
		},
		_create: function() {
			if (isNaN(this.options.extlstSize)) {
				this.options.extlstSize = 5; // Default to 5 if input was invalid
			}
			var self = this
			  , listitems = this.element.children('li')
			  , appendMoreButton = false
			  , hiddenEntriesCount = listitems.length - this.options.extlstSize;
			listitems.each(function(index, li) {
				// hide listitems when extlstSize is reached
				if(index >= self.options.extlstSize) {
					$(li).hide();
					// when we have hidden something, we need a more button
					appendMoreButton = true;
				}
			});
			if (appendMoreButton) {
				var btninner = $([
					'<a href="#" class="extensiblelist-morebtn">',
						this.options.extlstPlaceholder,
						'<span class="ui-li-count">', hiddenEntriesCount, '</span>',
					'</a>'].join(''));
				btninner.bind("click", $.proxy(function(event) {
					this._displayMoreItems(this.element, this.options.extlstSize);
				}, this));
				var morebtn = $('<li data-icon="false">')
					.addClass('ui-extensiblelist-morebtn')
					.append(btninner);
				this.element.append(morebtn);
			}
			//apply listview plugin
			this.element.listview();

			// only grab space if we are instructed and have some li's
			if ( this.options.extlstGrabspace && this.element.find('li').length > 0 ) {
				var list = this.element
				  , page = list.parents(':jqmData(role=page)');
				page.bind('pageshow', $.proxy(function() {
					var availableSpace = this._calculateAvailableSpace();
					if( availableSpace > 0 ) {
						 this._displayMoreItems(list, availableSpace);
					 }
				}, this));
			}
		},
		_displayMoreItems: function(list, size) {
			var morebtn = list.children(".ui-extensiblelist-morebtn")
			  , hiddenListitems = list.children('li:hidden')
			  , countBubble = morebtn.find('span.ui-li-count');
			// show 'size' hidden items
			hiddenListitems.each(function(index, li) {
				if(index < size) {
					$(li).show();
				}
			});
			// when no more items are hidden, remove the more button
			if (hiddenListitems.length <= size) {
				morebtn.remove();
			} else {
				// replace the text in the count bubble
				countBubble.html(hiddenListitems.length - size);
				if (this.options.extlstAutoscroll) {
					var scrollObject = $.browser.mozilla ? 'html' : 'body'; 
					$(scrollObject).animate({scrollTop: morebtn.position().top +'px'}, 800);
				}
			}
		},
		// returns the number of listitems that still fit onto page.
		// the heigth of the first non list-divider listitems represents the high of all other listitems
		_calculateAvailableSpace: function() {
			var list = this.element
			  , page = list.parents(':jqmData(role=page)')
			  , listTopPosition = Math.floor(list.position().top)
			  // With data-position=fixed the footer is not visible yet and therefore has no height.
			  // We assume a standard height of 50px if a footer exists on page
			  , footerHeight = page.find(':jqmData(role=footer)').length > 0 ? 50 : 0
			  , windowHeight = $(window).height()
			  , listHeight = list.height()
			  , approxListitemHeight = list.find('li').not(':jqmData(role=list-divider)').first().height() || 9999
			  , spacer = 80
			  , availableSpace = windowHeight - listTopPosition - footerHeight - listHeight - spacer;
			return Math.floor(availableSpace / approxListitemHeight);
		}
	});

	//auto self-init widgets
	$(document).bind('pagecreate', function(event) {
		$($.mobile.extensiblelist.prototype.options.initSelector, event.target).extensiblelist();
	});
}(jQuery));
