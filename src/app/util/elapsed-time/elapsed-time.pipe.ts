import { Pipe, PipeTransform } from '@angular/core';



/**
 * ng g p util/elapsed-time/elapsed-time --module app
 */
@Pipe({
  name: 'elapsedTime'
})
export class ElapsedTimePipe implements PipeTransform {

    transform(value: unknown, ...args: unknown[]): unknown {
        var formatTime = (str) => {
            let num = parseInt(str)
            let secMod = num % 60
            let secs = secMod < 10 ? '0'+secMod : secMod
            let mins = Math.floor(num / 60)
            return `${mins}:${secs}`
        }

        return formatTime(value);
    }

}