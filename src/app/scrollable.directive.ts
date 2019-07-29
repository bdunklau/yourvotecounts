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
      const height = event.srcElement.scrollingElement.scrollHeight;//this.el.nativeElement.scrollHeight;
      const offset = event.srcElement.scrollingElement.offsetHeight;//this.el.nativeElement.offsetHeight;
      if(top > height - offset - 1) {
        // console.log('top: ', top, ' height: ', height, ' offset: ', offset);
        // console.log('this.el = ', this.el);
        this.scrollPosition.emit('bottom');

      }
      if(top === 0) {
        console.log(event)
        this.scrollPosition.emit('top');
      }
    } catch(err) {}
  }

}
