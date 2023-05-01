import {
  AfterViewInit,
  Component,
  ElementRef,
  Renderer2,
  ViewChild,
} from '@angular/core';

import * as pdfjsLib from 'pdfjs-dist';

// url: http://localhost:4200/assets/Tenneo%20-%20Brand%20Guide.pdf
// url: http://localhost:4200/assets/sample.pdf

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {
  title = 'Customized pdf.js viewer'.toUpperCase();
  url = '../assets/G-Cube (MRCC) x ABND-Visual Identity_2.0 (2).pdf';
  urlInput: string = '';
  pdfDoc: any = null;
  pageNum: number = 1;
  totalPage: number = 0;
  isPageRendering = false;
  isPageNumPending: number | null = null;
  scale = 0.9;
  canvas: HTMLCanvasElement | any;
  ctx: any;
  @ViewChild('pdfRender') pdfRenderElement:
    | ElementRef<HTMLCanvasElement>
    | undefined;
  constructor(private render: Renderer2) {}

  ngAfterViewInit(): void {
    this.onViewPdf(this.url);
  }

  onChangeUrl(){
    this.url = this.urlInput;
    this.onViewPdf(this.url);
    console.log(this.url);
  }

  onViewPdf(url: string){
    console.log(this.pdfRenderElement);
    if (this.pdfRenderElement) {
      console.log(this.pdfRenderElement.nativeElement);
      this.canvas = this.pdfRenderElement.nativeElement;
      this.ctx = this.canvas.getContext('2d');
    }
    pdfjsLib.GlobalWorkerOptions.workerSrc = '../../node_modules/pdfjs-dist/build/pdf.worker.min.js';
    pdfjsLib.getDocument(url).promise.then((pdfDoc_: any) => {
      console.log(pdfDoc_);
      this.pdfDoc = pdfDoc_;
      this.totalPage = this.pdfDoc._pdfInfo.numPages;
      this.renderPage(this.pageNum);
    });
  }

  renderPage(number: number){
    this.isPageRendering = true;
    this.pdfDoc.getPage(number).then( (page: any) => {
      console.log(page);
      const viewport = page.getViewport({scale: this.scale});
      console.log(viewport);
      this.canvas.height = viewport.height;
      this.canvas.width = viewport.width;

      const renderCtx = {
        canvasContext: this.ctx,
        viewport
      };

      page.render(renderCtx).promise.then(() => {
        this.isPageRendering = false;
        if(this.isPageNumPending != null){
          this.renderPage(this.isPageNumPending);
          this.isPageNumPending = null;
        }

        this.pageNum  = number;
      });
    });
  }

  queueRenderPage(num: number){
    console.log('page num', num);
    if(this.isPageRendering){
      this.isPageNumPending = num;
    }else{
      this.renderPage(num);
    }
  }

  nextPage(){
    debugger
    console.log('next page');
    if(this.pageNum >= this.totalPage){
      return;
    }
    this.pageNum++;
    this.queueRenderPage(this.pageNum);
  }
  previousPage(){
    debugger
    console.log('previous page');
    if(this.pageNum <= 1){
      return;
    }
    this.pageNum--;
    this.queueRenderPage(this.pageNum);
  }
}
