/* eslint-disable @typescript-eslint/naming-convention */
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EmbeddedViewRef, Input, OnChanges, Renderer2, SecurityContext, SimpleChanges, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { blockcoreHighlightService } from '@blockcore/components/highlight/highlight.service';

@Component({
    selector       : 'textarea[blockcore-highlight]',
    templateUrl    : './highlight.component.html',
    styleUrls      : ['./highlight.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs       : 'blockcoreHighlight'
})
export class blockcoreHighlightComponent implements OnChanges, AfterViewInit
{
    @Input() code: string;
    @Input() lang: string;
    @ViewChild(TemplateRef) templateRef: TemplateRef<any>;

    highlightedCode: string;
    private _viewRef: EmbeddedViewRef<any>;

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _domSanitizer: DomSanitizer,
        private _elementRef: ElementRef,
        private _renderer2: Renderer2,
        private _blockcoreHighlightService: blockcoreHighlightService,
        private _viewContainerRef: ViewContainerRef
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On changes
     *
     * @param changes
     */
    ngOnChanges(changes: SimpleChanges): void
    {
        // Code & Lang
        if ( 'code' in changes || 'lang' in changes )
        {
            // Return if the viewContainerRef is not available
            if ( !this._viewContainerRef.length )
            {
                return;
            }

            // Highlight and insert the code
            this._highlightAndInsert();
        }
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void
    {
        // Return if there is no language set
        if ( !this.lang )
        {
            return;
        }

        // If there is no code input, get the code from
        // the textarea
        if ( !this.code )
        {
            // Get the code
            this.code = this._elementRef.nativeElement.value;
        }

        // Highlight and insert
        this._highlightAndInsert();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Highlight and insert the highlighted code
     *
     * @private
     */
    private _highlightAndInsert(): void
    {
        // Return if the template reference is not available
        if ( !this.templateRef )
        {
            return;
        }

        // Return if the code or language is not defined
        if ( !this.code || !this.lang )
        {
            return;
        }

        // Destroy the component if there is already one
        if ( this._viewRef )
        {
            this._viewRef.destroy();
            this._viewRef = null;
        }

        // Highlight and sanitize the code just in case
        this.highlightedCode = this._domSanitizer.sanitize(SecurityContext.HTML, this._blockcoreHighlightService.highlight(this.code, this.lang));

        // Return if the highlighted code is null
        if ( this.highlightedCode === null )
        {
            return;
        }

        // Render and insert the template
        this._viewRef = this._viewContainerRef.createEmbeddedView(this.templateRef, {
            highlightedCode: this.highlightedCode,
            lang           : this.lang
        });

        // Detect the changes
        this._viewRef.detectChanges();
    }
}
