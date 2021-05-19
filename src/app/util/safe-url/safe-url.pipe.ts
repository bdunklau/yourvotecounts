import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';



/**
 * ng generate pipe util/safe-url --module=app
 * 
 * This is for sms: protocol links.  Otherwise we get this "unsafe link" error and the links don't work.
 * What we're doing is using <a> tags to launch the user's text messaging app so we can easily text someone
 * opt-in instructions
 * 
 * ref:  https://stackoverflow.com/a/40756718
 */
@Pipe({
  name: 'safeUrl'
})
export class SafeUrlPipe implements PipeTransform {

    constructor(private domSanitizer: DomSanitizer) {}
    transform(url) {
        return this.domSanitizer.bypassSecurityTrustResourceUrl(url);
    }

}

