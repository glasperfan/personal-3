import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'markdown'})
export class MarkdownPipe implements PipeTransform {

  private urlRegex = /[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;

  transform(text: string): string {
    // Preserve newlines
    text = text.replace(/\n/g, '<br/>');
    // Create links
    text = this.linkify(text);
    return text;
  }

  private linkify(inputText: string): string {

    const httpPattern = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    inputText = inputText.replace(httpPattern, '<a href="$1" target="_blank">$1</a>');

    const noHttpPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    inputText = inputText.replace(noHttpPattern, '$1<a href="http://$2" target="_blank">$2</a>');

    return inputText;
  }
}
