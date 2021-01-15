import { Pipe, PipeTransform } from '@angular/core';
import linkifyHtml = require('linkifyjs/html');



/**
 * ng generate pipe util/linkify/linkify --module=app
 */
@Pipe({
  name: 'linkify'
})
export class LinkifyPipe implements PipeTransform {

    transform(value: unknown, ...args: unknown[]): unknown {
        return linkifyHtml(value, {defaultProtocol: 'https'}); ;
    }

}
