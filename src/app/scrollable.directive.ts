import { Directive, HostListener, EventEmitter, Output, ElementRef } from '@angular/core';

@Directive({
  selector: '[appScrollable]'
})
// got all this from   https://angularfirebase.com/lessons/infinite-scroll-firestore-angular/
export class ScrollableDirective {

  @Output() scrollPosition = new EventEmitter();

  constructor(public el: ElementRef) { }

  @HostListener('document:scroll', ['$event'])
  onScroll(event) {

      // console.log('onScroll(): event=', event);
    try {
      const top = event.srcElement.scrollingElement.scrollTop;
      const height = event.srcElement.scrollingElement.scrollHeight;
      const offset = event.srcElement.scrollingElement.offsetHeight;
      if(top > height - offset - 1) {
        this.scrollPosition.emit('bottom'); // see log.component.ts:scrollHandler()

      }
      if(top === 0) {
        this.scrollPosition.emit('top'); // see log.component.ts:scrollHandler()
      }
    } catch(err) {}
  }

}
