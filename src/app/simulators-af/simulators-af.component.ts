import {
  Component,
  DEFAULT_CURRENCY_CODE,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Client } from '../client';
import { ClientService } from '../client.service';
import { MatTabGroup } from '@angular/material/tabs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { MatDialog } from '@angular/material/dialog';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import { DialogExampleComponent } from '../dialog-example/dialog-example.component';

import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { CurrencyPipe, formatCurrency } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { DialogExampleComponent2 } from '../dialog-example2/dialog-example.component';
declare var hbspt: any; // put this at the top

class Product {
  name: string;
  tasaAnual: number;
  tasaPeriodica: number;
  numeroCuotas: number;
  cuotaPeriodica: number;
  totalInteres: number;
}

@Component({
  selector: 'app-simulators-af',
  templateUrl: './simulators-af.component.html',
  styleUrls: ['./simulators-af.component.css'],
})
export class SimulatorsAfComponent implements OnInit {
  // data y current_clien almacena los datos del formulario de contacto para posterior envio a BaseDeDatos
  data: Client[];
  current_clien: Client;

  //curd_oepration variable para guardar el estado del formulario
  crud_operation = { is_new: false, is_visible: false };

  //selectIndex guarda el estado del matSlider
  selectedIndex = 0;

  //*****************************************************
  /*Variables Simuladores Ahorro*/
  //Ahorro Flex
  amount: number;
  term: number;
  tiempoMeses: number;
  returnRate: number;
  // retention: number;
  total: number;
  /**Variables Ahorros para guardar peticiones del API */

  tasaAhorroFlexSave: number;
  tiempoMinAhorroFlexSave: number;
  tiempoMaxAhorroFlexSave: number;

  /**Varibles para almacenar las consultas api de credito y ahorro */
  datosFlexSaving = null;

  nombreProducto: string;
  itemS: number;
  isTranslated = false;

  cp: CurrencyPipe;

  constructor(
    private service: ClientService,
    private toastr: ToastrService,
    public dialog: MatDialog,
    private translate: TranslateService
  ) {
    this.data = [];
    this.itemS = 0;
    this.term = this.tiempoMinAhorroFlexSave;
    this.amount = 1;
    this.nombreProducto = 'Ahorro FlexSave';
    translate.addLangs(['es', 'en']);
    translate.setDefaultLang('es');
  }

  openDialog() {
    this.dialog.open(DialogExampleComponent);
  }

  openDialog2() {
    this.dialog.open(DialogExampleComponent2);
  }

  ngOnInit(): void {
    this.service.getFlexSaving().subscribe(
      (datos) => {
        this.datosFlexSaving = datos;
        for (let x of this.datosFlexSaving) {
          this.tasaAhorroFlexSave = x.rate;
          this.tiempoMinAhorroFlexSave = x.minimum_time;
          this.tiempoMaxAhorroFlexSave = x.maximum_time;
        }
        // console.log('TasaFlex', this.tasaAhorroFlexSave);
      },
      (error) => {
        // console.log('ERROR DE CONEXION', error);
        this.refresh();
      }
    );
  }

  refresh(): void {
    window.location.reload();
  }
  useLanguage(language: string) {
    this.translate.use(language);
    if (language == 'es') {
      this.isTranslated = false;
    } else {
      this.isTranslated = true;
    }
  }
  /************************************************************************ */
  //Funciones para capturar cambio de pestana

  @ViewChild('mattabgroup', { static: false }) mattabgroup: MatTabGroup;

  _selectedTabChange(index: number) {
    // console.log('_selectTabChange ' + index);
  }

  _selectedIndexChange(index: number) {
    // console.log('_selectedIndexChange ' + index);
  }

  _select(index: number) {
    // console.log('_select ' + index);
    this.selectedIndex = index;
  }

  /****************************************************************** */

  //Funciones Simuladores de Ahorro

  flexSave(): void {
    this.tiempoMeses = this.term * 0.0328767;
    // console.log("tiempo meses", this.tiempoMeses);
    if (
      this.term < this.tiempoMinAhorroFlexSave ||
      this.term > this.tiempoMaxAhorroFlexSave ||
      this.amount > 1000000
    ) {
      this.term = this.tiempoMinAhorroFlexSave;
      this.amount = 1;
      this.toastr.warning('Límites fuera de rango ', 'Advertencia', {
        timeOut: 4500,
      });
    } else {
      this.returnRate =
        (this.amount * this.term * this.tasaAhorroFlexSave) / 360 / 100;
      // this.retention = this.returnRate * 0.02;
      this.total = this.amount + this.returnRate;
      // console.log("tiempo en meses", this.tiempoMeses);
    }
  }

  /************************************** */
  //Funciones para Guardar el formulario de cliente mediante el api
  new() {
    this.current_clien = new Client();
    this.crud_operation.is_visible = true;
    this.crud_operation.is_new = true;
    // hbspt.forms.create({
    //   portalId: '8821548',
    //   formId: 'b3e4925e-7ec3-45ef-b106-e085420d9091',
    //   target: '#hubspotForm',
    // });
    hbspt.forms.create({
      portalId: '6606991',
      formId: '70816719-56a7-467f-b589-ea231934f9c3',
      target: '#hubspotForm',
    });
    window.scrollTo(0, 0);
  }

  save() {
    if (this.crud_operation.is_new) {
      this.toastr.success('Ingresado Exitosamente', 'Cliente', {
        timeOut: 1500,
      });
      this.crud_operation.is_visible = false;
      this.service.insert(this.current_clien).subscribe((res) => {
        this.current_clien = new Client();
      });
      return;
    }
  }
  /********************************** */

  //Funciones formato mat-slider
  formatoTiempo(value: number) {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'd';
    }
    return value;
  }
  formatoMonto(value: number) {
    if (value >= 1000) {
      this.amount = value;
      return Math.round(value / 1000) + 'k';
    }
    return value;
  }

  onInputChangeMontoFlex(event: any) {
    // console.log(event.value);
    this.amount = event.value;
  }
  onInputChangeTiempoFlex(event: any) {
    // console.log(event.value);
    this.term = event.value;
  }

  getBase64ImageFromURL(url) {
    return new Promise((resolve, reject) => {
      var img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');
      img.onload = () => {
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        var dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      };
      img.onerror = (error) => {
        reject(error);
      };
      img.src = url;
    });
  }

  img_footer = this.getBase64ImageFromURL('../../assets/images/franja.png');
  currencyPipeString: string;
  transformdValue: any;
  formatedOutputValue: any;

  async generatePDF(action = 'download') {
    let docDefinition = {
      footer: {
        columns: [
          {
            image: await this.getBase64ImageFromURL(
              '../../assets/images/footer3Pdf.PNG'
            ),
            width: 600,
            heigth: 1,
          },
        ],
      },
      header: {
        columns: [
          {
            image: await this.getBase64ImageFromURL(
              '../../assets/images/franja.png'
            ),
            width: 600,
            heigth: 1,
          },
        ],
      },
      content: [
        {
          columns: [
            {
              image: await this.getBase64ImageFromURL(
                '../../assets/images/logo.png'
              ),
              width: 150,
            },

            {
              text: `Fecha: ${new Date().toLocaleString()}\n Producto : ${
                this.nombreProducto
              }`,
              alignment: 'right',
            },
          ],
        },
        {
          aligment: 'center',
          text: '  ',
        },
        {
          aligment: 'center',
          text: '  ',
        },
        {
          columns: [
            {
              table: {
                layout: 'lightHorizontalLines',
                headerRows: 1,
                widths: ['auto', 'auto'],
                body: [
                  [
                    {
                      text: 'Detalles Simulación',
                      alignment: 'center',
                      fillColor: '#b40c15',
                      color: 'white',
                      colSpan: 2,
                    },
                    {},
                  ],

                  [
                    { text: 'Monto de Ahorro', bold: true },
                    `${Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(this.amount)}`,
                  ],
                  [
                    { text: 'Tasa Nominal Vigente', bold: true },
                    `${this.tasaAhorroFlexSave}%`,
                  ],
                  [{ text: 'Plazo (Días)', bold: true }, `${this.term}`],
                  [
                    { text: 'Interés Ganado Referencial', bold: true },
                    `${Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(this.returnRate)}`,
                  ],
                  // [
                  //   { text: 'Retención IR', bold: true },
                  //   `${Intl.NumberFormat('en-US', {
                  //     style: 'currency',
                  //     currency: 'USD',
                  //   }).format(this.retention)}`,
                  // ],
                  [
                    { text: 'Total a Recibir', bold: true },
                    `${Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(this.total)}`,
                  ],
                ],
              },
              width: 350,
            },
            {
              table: {
                headerRows: 1,
                widths: ['auto'],
                body: [
                  [{ text: 'Visita Nuestra Página Web', alignment: 'right' }],
                  [{ qr: `https://www.bancoprocredit.com.ec/`, fit: '100' }],
                ],
              },
              alignment: 'center',
              layout: 'noBorders',
            },
          ],
        },
      ],
      styles: {
        table: {
          bold: true,
          fontSize: 10,
          alignment: 'center',
          decorationColor: 'red',
        },
        sectionHeader: {
          bold: true,
          decoration: 'underline',
          fontSize: 14,
          margin: [0, 15, 0, 15],
        },
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5],
        },
        tableExample: {
          margin: [0, 5, 0, 15],
        },
        tableOpacityExample: {
          margin: [0, 5, 0, 15],
          fillColor: 'blue',
          fillOpacity: 0.3,
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'red',
          background: 'black',
        },
      },
    };
    if (action === 'download') {
      pdfMake.createPdf(docDefinition).download();
    } else if (action === 'print') {
      pdfMake.createPdf(docDefinition).print();
    } else {
      pdfMake.createPdf(docDefinition).download();
    }
  }
  async generatePDF_English(action = 'download') {
    let docDefinition = {
      footer: {
        columns: [
          {
            image: await this.getBase64ImageFromURL(
              '../../assets/images/footer3Pdf.PNG'
            ),
            width: 600,
            heigth: 1,
          },
        ],
      },
      header: {
        columns: [
          {
            image: await this.getBase64ImageFromURL(
              '../../assets/images/franja.png'
            ),
            width: 600,
            heigth: 1,
          },
        ],
      },
      content: [
        {
          columns: [
            {
              image: await this.getBase64ImageFromURL(
                '../../assets/images/logo.png'
              ),
              width: 150,
            },

            {
              text: `Date: ${new Date().toLocaleString()}\n Product : FlexSave savings`,
              alignment: 'right',
            },
          ],
        },
        {
          aligment: 'center',
          text: '  ',
        },
        {
          aligment: 'center',
          text: '  ',
        },
        {
          columns: [
            {
              table: {
                layout: 'lightHorizontalLines',
                headerRows: 1,
                widths: ['auto', 'auto'],
                body: [
                  [
                    {
                      text: 'Simulation details',
                      alignment: 'center',
                      fillColor: '#b40c15',
                      color: 'white',
                      colSpan: 2,
                    },
                    {},
                  ],

                  [
                    { text: 'Savings Amount', bold: true },
                    `${Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(this.amount)}`,
                  ],
                  [
                    { text: 'Current Nominal Rate', bold: true },
                    `${this.tasaAhorroFlexSave}%`,
                  ],
                  [{ text: 'Term (Days)', bold: true }, `${this.term}`],
                  [
                    { text: 'Referential Earned Interest', bold: true },
                    `${Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(this.returnRate)}`,
                  ],
                  // [
                  //   { text: 'Retención IR', bold: true },
                  //   `${Intl.NumberFormat('en-US', {
                  //     style: 'currency',
                  //     currency: 'USD',
                  //   }).format(this.retention)}`,
                  // ],
                  [
                    { text: 'Total to Receive', bold: true },
                    `${Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(this.total)}`,
                  ],
                ],
              },
              width: 350,
            },
            {
              table: {
                headerRows: 1,
                widths: ['auto'],
                body: [
                  [{ text: 'Visit our website', alignment: 'right' }],
                  [{ qr: `https://www.bancoprocredit.com.ec/`, fit: '100' }],
                ],
              },
              alignment: 'center',
              layout: 'noBorders',
            },
          ],
        },
      ],
      styles: {
        table: {
          bold: true,
          fontSize: 10,
          alignment: 'center',
          decorationColor: 'red',
        },
        sectionHeader: {
          bold: true,
          decoration: 'underline',
          fontSize: 14,
          margin: [0, 15, 0, 15],
        },
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5],
        },
        tableExample: {
          margin: [0, 5, 0, 15],
        },
        tableOpacityExample: {
          margin: [0, 5, 0, 15],
          fillColor: 'blue',
          fillOpacity: 0.3,
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'red',
          background: 'black',
        },
      },
    };
    if (action === 'download') {
      pdfMake.createPdf(docDefinition).download();
    } else if (action === 'print') {
      pdfMake.createPdf(docDefinition).print();
    } else {
      pdfMake.createPdf(docDefinition).download();
    }
  }
}
