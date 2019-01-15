import { Component, ViewChild, ElementRef, OnInit, Input, EventEmitter, OnDestroy, Renderer2 } from '@angular/core';
import { DrawingsEventSource } from '../../events/drawings-event-source';
import { TextAddedDataEvent, TextEditedDataEvent } from '../../events/event-source';
import { ToolsService } from '../../../services/tools.service';
import { select } from 'd3-selection';
import { TextElement } from '../../models/drawings/text-element';
import { Context } from '../../models/context';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.scss']
})
export class TextEditorComponent implements OnInit, OnDestroy {
  @ViewChild('temporaryTextElement') temporaryTextElement: ElementRef;
  @Input('svg') svg: SVGSVGElement;

  private leftPosition: string = '0px';
  private topPosition: string = '0px';
  private innerText: string = '';

  private editingDrawingId: string;
  private editedElement: any;

  private mapListener: Function;
  private textListener: Function;
  private textAddingSubscription: Subscription;
  public addingFinished = new EventEmitter<any>();

  constructor(
    private drawingsEventSource: DrawingsEventSource,
    private toolsService: ToolsService,
    private context: Context,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.textAddingSubscription = this.toolsService.isTextAddingToolActivated.subscribe((isActive: boolean) => {
      isActive ? this.activateTextAdding() : this.deactivateTextAdding();
    });

    this.activateTextEditing();
  }

  activateTextAdding() {
    let addTextListener = (event: MouseEvent) => {
      this.leftPosition = event.clientX.toString() + 'px';
      this.topPosition = (event.clientY + window.pageYOffset).toString() + 'px';
      this.renderer.setStyle(this.temporaryTextElement.nativeElement, 'display', 'initial');
      this.temporaryTextElement.nativeElement.focus();

      let textListener = () => {
        this.drawingsEventSource.textAdded.emit(
          new TextAddedDataEvent(
            this.temporaryTextElement.nativeElement.innerText.replace(/\n$/, ''),
            event.clientX,
            event.clientY
          )
        );
        this.deactivateTextAdding();
        this.innerText = '';
        this.temporaryTextElement.nativeElement.removeEventListener('focusout', this.textListener);
        this.renderer.setStyle(this.temporaryTextElement.nativeElement, 'display', 'none');
      };
      this.textListener = textListener;
      this.temporaryTextElement.nativeElement.addEventListener('focusout', this.textListener);
    };

    this.deactivateTextAdding();
    this.mapListener = addTextListener;
    this.svg.addEventListener('click', this.mapListener as EventListenerOrEventListenerObject);
  }

  deactivateTextAdding() {
    this.svg.removeEventListener('click', this.mapListener as EventListenerOrEventListenerObject);
  }

  activateTextEditing() {
    const rootElement = select(this.svg);

    rootElement
      .selectAll<SVGTextElement, TextElement>('text.text_element')
      .on('dblclick', (elem, index, textElements) => {
        this.renderer.setStyle(this.temporaryTextElement.nativeElement, 'display', 'initial');
        this.editedElement = elem;

        select(textElements[index]).attr('visibility', 'hidden');

        select(textElements[index]).classed('editingMode', true);

        this.editingDrawingId = textElements[index].parentElement.parentElement.getAttribute('drawing_id');
        var transformData = textElements[index].parentElement.getAttribute('transform').split(/\(|\)/);
        var x = Number(transformData[1].split(/,/)[0]) + this.context.getZeroZeroTransformationPoint().x;
        var y = Number(transformData[1].split(/,/)[1]) + this.context.getZeroZeroTransformationPoint().y;
        this.leftPosition = x.toString() + 'px';
        this.topPosition = y.toString() + 'px';
        this.temporaryTextElement.nativeElement.innerText = elem.text;

        let listener = () => {
          let innerText = this.temporaryTextElement.nativeElement.innerText;
          this.drawingsEventSource.textEdited.emit(
            new TextEditedDataEvent(this.editingDrawingId, innerText.replace(/\n$/, ''), this.editedElement)
          );

          rootElement
            .selectAll<SVGTextElement, TextElement>('text.editingMode')
            .attr('visibility', 'visible')
            .classed('editingMode', false);

          this.innerText = '';
          this.temporaryTextElement.nativeElement.innerText = '';
          this.temporaryTextElement.nativeElement.removeEventListener('focusout', this.textListener);

          this.renderer.setStyle(this.temporaryTextElement.nativeElement, 'display', 'none');
        };
        this.textListener = listener;
        this.temporaryTextElement.nativeElement.addEventListener('focusout', this.textListener);
        this.temporaryTextElement.nativeElement.focus();
      });
  }

  ngOnDestroy() {
    this.textAddingSubscription.unsubscribe();
  }
}
