import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
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
import { async } from '@angular/core/testing';

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
  selector: 'app-simulators-e',
  templateUrl: './simulators-e.component.html',
  styleUrls: ['./simulators-e.component.css'],
})
export class SimulatorsEComponent implements OnInit {
  // data y current_clien almacena los datos del formulario de contacto para posterior envio a BaseDeDatos
  data: Client[];
  current_clien: Client;

  //curd_oepration variable para guardar el estado del formulario
  crud_operation = { is_new: false, is_visible: false };

  //amortizacionIA y amortizacionF guarda el estado de las tablas de amortizacion
  amortizacionIA = { is_visible: false };
  amortizacionF = { is_visible: false };

  //cerratTabla variable para guardar el estado del boton de cerrar tabla
  cerrarTabla = { is_visible: false };
  botonSimulacion = { is_visible: false };
  botonSimulacion2 = { is_visible: true };

  //francesa y alemana variables para uardar el estado de las tablas de datos de simuladores
  francesa = { is_visible: true };
  alemana = { is_visible: false };

  //*****************************************************

  //*****************************************************
  /*Variables Simuladores Credito*/
  //Variables Generales Simuladores Creditos
  tasaInteresAnual: number;
  porcentajeSeguroDesgravamen: number;
  tasaInteresPeriodica: number;
  valorPrestamo: number;
  tiempoPrestamo: number;
  numeroDePagosPorAno: number;
  numeroCuotas: number;

  //Variables para calcular la simulacion de los creditos Sistema Aleman
  interesDelPeriodoIA: number;
  capitalAmortizadoIA: number;
  cuotaPagarIA: number;
  saldoRemanenteIA: number;
  dataAleman = [];
  sumaIntereses: number;
  valorSeguroDesgravamen: number;
  cuotaInicial: number;
  sumaSeguroDesgravamenA: number;

  // variables para calcular la simulacion de los creditos Sistema Frances
  interesDelPeriodoF: number;
  capitalAmortizadoF: number;
  cuotaPagarF: number;
  saldoRemanenteF: number;
  dataFrances = [];
  sumaInteresesF: number;
  base: number;
  cuotaFrancesa: number;
  valorSeguroDesgravamenF: number;
  sumaSeguroDesgravamenF: number;

  /***************************************************** */

  /**Variables Creditos para guardar peticiones del API */
  tasaCreditoEducativo: number;
  montoMinCreditoEducativo: number;
  montoMaxCreditoEducativo: number;
  tiempoMinCreditoEducativo: number;
  tiempoMaxCreditoEducativo: number;

  /**Varibles para almacenar las consultas api de credito y ahorro */
  datosCreditoEducativo = null;
  porcentajeSD = null;
  nombreProducto: string;
  itemS: number;
  liquidoRecibir: number;
  tasaEfectiva: number;
  solca: number;

  botoncolorF=false
  botoncolorA=true


  constructor(
    private service: ClientService,
    private toastr: ToastrService,
    public dialog: MatDialog
  ) {
    this.data = [];
    this.itemS = 0;
    this.nombreProducto = 'Crédito Educativo';
    this.francesa.is_visible = false;
  }

  openDialog() {
    this.dialog.open(DialogExampleComponent);
  }

  ngOnInit(): void {
    this.francesa.is_visible = true;
    this.service.getCreditoEducativo().subscribe(
      (datos) => {
        this.datosCreditoEducativo = datos;
        for (let x of this.datosCreditoEducativo) {
          this.tasaCreditoEducativo = x.tasa;
          this.montoMinCreditoEducativo = x.montomin;
          this.montoMaxCreditoEducativo = x.montomax;
          this.tiempoMinCreditoEducativo = x.tiempomin;
          this.tiempoMaxCreditoEducativo = x.tiempomax;
        }
        this.tasaEfectiva =
          Math.pow(1 + this.tasaCreditoEducativo / 12 / 100, 12) - 1;

        // console.log('tasaeducativo', this.tasaCreditoEducativo);
      },
      (error) => {
        // console.log('ERROR DE CONEXION', error);
        this.refresh();
      }
    );
    this.porcentajeSD = 0.655;
  }

  refresh(): void {
    window.location.reload();
  }

  cerrarTablas(): void {
    this.amortizacionF.is_visible = false;
    this.amortizacionIA.is_visible = false;
    this.botonSimulacion2.is_visible = true;
    this.botonSimulacion.is_visible = false;
  }

  vetTablaIA() {
    this.amortizacionIA.is_visible = true;
    this.cerrarTabla.is_visible = true;
    this.botonSimulacion.is_visible = true;
    this.botonSimulacion2.is_visible = false;
  }
  vetTablaFrancesa() {
    this.amortizacionF.is_visible = true;
    this.cerrarTabla.is_visible = true;
    this.botonSimulacion.is_visible = true;
    this.botonSimulacion2.is_visible = false;
  }

  verFrancesa(): void {
    this.francesa.is_visible = true;
    this.alemana.is_visible = false;
    this.botoncolorF=false;
    this.botoncolorA=true;
    this.cerrarTablas();
  }

  verAlemana(): void {
    this.alemana.is_visible = true;
    this.francesa.is_visible = false;
    this.botoncolorF=true;
    this.botoncolorA=false;
    this.cerrarTablas();
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
  }

  /****************************************************************** */

  limpiarDatos(): void {
    this.tasaInteresAnual = 0;
    this.porcentajeSeguroDesgravamen = 0;
    this.tasaInteresPeriodica = 0;
    this.valorPrestamo = 0;
    this.tiempoPrestamo = 0;
    this.numeroDePagosPorAno = -0;
    this.numeroCuotas = 0;
    this.interesDelPeriodoIA = 0;
    this.capitalAmortizadoIA = 0;
    this.valorSeguroDesgravamen = 0;
    this.cuotaPagarIA = 0;
    this.saldoRemanenteIA = 0;
    this.dataAleman = [];
    this.dataFrances = [];
    this.sumaIntereses = 0;
    this.interesDelPeriodoF = 0;
    this.capitalAmortizadoF = 0;
    this.cuotaPagarF = 0;
    this.saldoRemanenteF = 0;
    this.sumaInteresesF = 0;
    this.base = 0;
    this.cuotaFrancesa = 0;
    this.amortizacionIA.is_visible = false;
    this.alemana.is_visible = false;
  }

  limpiarTabla(): void {
    this.dataAleman = [];
    this.dataFrances = [];
  }

  transform(value: any) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");;
}

  /************************************************************* */
  /**Funciones Simuladores de Credito */

  simuladorEducativo(): void {
    this.limpiarTabla();
    /**Variables globales para los dos sistemas */
    // this.tasaInteresAnual = this.tasaCreditoEducativo;
    // this.tasaInteresPeriodica = this.tasaInteresAnual / 12;
    // this.porcentajeSeguroDesgravamen = 0.655 / 100;
    // this.solca = (this.valorPrestamo * 0.5) / 100;
    // console.log('valor solca', this.solca);
    // this.liquidoRecibir = this.valorPrestamo - this.solca;
    // console.log('tasa efectiva', this.tasaEfectiva);
    if (
      this.valorPrestamo > this.montoMaxCreditoEducativo ||
      this.valorPrestamo < this.montoMinCreditoEducativo
    ) {
      this.valorPrestamo = this.montoMinCreditoEducativo;
      this.toastr.warning(
        `Monto máximo $${this.transform(this.montoMaxCreditoEducativo)}, monto mínimo $${this.transform(this.montoMinCreditoEducativo)} `,
        'Monto fuera de rango',
        {
          timeOut: 4500,
        }
      );
    } else if (
      this.numeroCuotas > this.tiempoMaxCreditoEducativo ||
      this.numeroCuotas < this.tiempoMinCreditoEducativo
    ) {
      this.numeroCuotas = this.tiempoMinCreditoEducativo;
      this.toastr.warning(
        `Tiempo máximo ${this.tiempoMaxCreditoEducativo} meses, tiempo mínimo ${this.tiempoMinCreditoEducativo} meses`,
        'Tiempo fuera de rango',
        {
          timeOut: 4500,
        }
      );
    } else {
      this.tasaInteresAnual = this.tasaCreditoEducativo;
      this.tasaInteresPeriodica = this.tasaInteresAnual / 12;
      this.porcentajeSeguroDesgravamen = 0.655 / 100;
      this.solca = (this.valorPrestamo * 0.5) / 100;
      // console.log('valor solca', this.solca);
      this.liquidoRecibir = this.valorPrestamo - this.solca;
      // console.log('tasa efectiva', this.tasaEfectiva);
      /**Calculo Frances */
      //valores calculo frances
      this.capitalAmortizadoF = 0;
      this.sumaInteresesF = 0;
      this.sumaSeguroDesgravamenF = 0;
      this.base = 1 + this.tasaInteresPeriodica / 100;
      this.saldoRemanenteF = this.valorPrestamo;
      this.valorSeguroDesgravamenF =
        (this.saldoRemanenteF * this.porcentajeSeguroDesgravamen) / 12;
      this.interesDelPeriodoF =
        (this.saldoRemanenteF * this.tasaInteresPeriodica) / 100;
      this.cuotaFrancesa =
        (this.tasaInteresPeriodica /
          100 /
          (1 - Math.pow(this.base, -this.numeroCuotas))) *
        this.valorPrestamo;
      this.cuotaPagarF =
        (this.tasaInteresPeriodica /
          100 /
          (1 - Math.pow(this.base, -this.numeroCuotas))) *
          this.valorPrestamo +
        this.valorSeguroDesgravamenF;
      this.capitalAmortizadoF = this.cuotaFrancesa - this.interesDelPeriodoF;
      this.saldoRemanenteF = this.saldoRemanenteF - this.capitalAmortizadoF;

      for (let i = 0; i < this.numeroCuotas; i++) {
        this.dataFrances.push({
          numeroCuota: i + 1,
          interesPeriodo: this.interesDelPeriodoF,
          capitalAmortizado: this.capitalAmortizadoF,
          seguro: this.valorSeguroDesgravamenF,
          cuotaPagar: this.cuotaPagarF,
          saldoRemanente: this.saldoRemanenteF,
        });
        this.sumaSeguroDesgravamenF =
          this.sumaSeguroDesgravamenF + this.valorSeguroDesgravamenF;

        this.sumaInteresesF = this.sumaInteresesF + this.interesDelPeriodoF;
        this.valorSeguroDesgravamenF =
          (this.saldoRemanenteF * this.porcentajeSeguroDesgravamen) / 12;
        this.interesDelPeriodoF =
          (this.saldoRemanenteF * this.tasaInteresPeriodica) / 100;
        this.cuotaPagarF =
          (this.tasaInteresPeriodica /
            100 /
            (1 - Math.pow(this.base, -this.numeroCuotas))) *
            this.valorPrestamo +
          this.valorSeguroDesgravamenF;
        this.capitalAmortizadoF = this.cuotaFrancesa - this.interesDelPeriodoF;
        this.saldoRemanenteF = this.saldoRemanenteF - this.capitalAmortizadoF;
        // console.log('suma seguro d', this.sumaSeguroDesgravamenF);
      }

      /**Calculo Aleman */
      //valor fijo capital amortizado calculo aleman
      this.sumaIntereses = 0;
      this.sumaSeguroDesgravamenA = 0;
      this.saldoRemanenteIA = this.valorPrestamo;
      this.capitalAmortizadoIA = this.valorPrestamo / this.numeroCuotas;
      //valores calculo aleman
      this.interesDelPeriodoIA =
        (this.saldoRemanenteIA * this.tasaInteresPeriodica) / 100;
      this.valorSeguroDesgravamen =
        (this.saldoRemanenteIA * this.porcentajeSeguroDesgravamen) / 12;
      this.cuotaPagarIA =
        this.interesDelPeriodoIA +
        this.capitalAmortizadoIA +
        this.valorSeguroDesgravamen;
      this.saldoRemanenteIA = this.saldoRemanenteIA - this.capitalAmortizadoIA;
      // console.log('interes aleman primera cuota', this.interesDelPeriodoIA);
      this.cuotaInicial = this.cuotaPagarIA;
      for (let i = 0; i < this.numeroCuotas; i++) {
        /**Calculo Aleman */
        this.dataAleman.push({
          numeroCuota: i + 1,
          interesPeriodo: this.interesDelPeriodoIA,
          capitalAmortizado: this.capitalAmortizadoIA,
          seguro: this.valorSeguroDesgravamen,
          cuotaPagar: this.cuotaPagarIA,
          saldoRemanente: this.saldoRemanenteIA,
        });
        this.sumaSeguroDesgravamenA =
          this.sumaSeguroDesgravamenA + this.valorSeguroDesgravamen;
        this.sumaIntereses = this.sumaIntereses + this.interesDelPeriodoIA;
        this.interesDelPeriodoIA =
          (this.saldoRemanenteIA * this.tasaInteresPeriodica) / 100;
        this.valorSeguroDesgravamen =
          (this.saldoRemanenteIA * this.porcentajeSeguroDesgravamen) / 12;
        this.cuotaPagarIA =
          this.interesDelPeriodoIA +
          this.capitalAmortizadoIA +
          this.valorSeguroDesgravamen;
        this.saldoRemanenteIA =
          this.saldoRemanenteIA - this.capitalAmortizadoIA;
      }
    }
  }

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

      formId: '87a486a8-87f8-49de-a6bf-efb79658e7a6',
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

  /************************************************ */
  //Funciones formato mat-slider
  formatoTiempo(value: number) {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'd';
    }
    return value;
  }
  formatoMonto(value: number) {
    if (value >= 1000) {
      this.valorPrestamo = value;
      return Math.round(value / 1000) + 'k';
    }
    return value;
  }
  onInputChangeMonto(event: any) {
    // console.log(event.value);
    this.valorPrestamo = event.value;
  }

  onInputChangeTiempo(event: any) {
    // console.log(event.value);
    this.numeroCuotas = event.value;
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
  async generatePDF(action = 'download') {
    if (this.francesa.is_visible) {
      //credito educativo
      let docDefinition = {
        footer: {
          columns: [
            {
              // width:'*',
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
              // width:'*',
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
                }\n Amortización Francesa`,
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
                      { text: 'Monto del Préstamo', bold: true },
                      `${Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(this.valorPrestamo)}`,
                    ],
                    [
                      { text: 'Plazo (Meses)', bold: true },
                      `${this.numeroCuotas}`,
                    ],
                    [
                      { text: 'Tasa de Interés', bold: true },
                      `${this.tasaInteresAnual.toFixed(2)}%`,
                    ],
                    [
                      { text: 'Tasa Interés Periódica', bold: true },
                      `${this.tasaInteresPeriodica.toFixed(2)}%`,
                    ],
                    [
                      { text: 'Tasa Interés Efectiva', bold: true },
                      `${(this.tasaEfectiva * 100).toFixed(2)}%`,
                    ],
                    [
                      { text: 'Tasa Seguro', bold: true },
                      `${this.porcentajeSD.toFixed(3)}%`,
                    ],
                    [
                      { text: 'Total Seguro a Pagar', bold: true },
                      `${Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(this.sumaSeguroDesgravamenF)}`,
                    ],
                    [
                      { text: 'Contribución SOLCA 0.5%', bold: true },
                      `${Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(this.solca)}`,
                    ],
                    [
                      { text: 'Liquido a Recibir', bold: true },
                      `${Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(this.liquidoRecibir)}`,
                    ],
                    [
                      { text: 'Cuota a Pagar Periódicamente', bold: true },
                      `${Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(this.cuotaPagarF)}`,
                    ],
                    [
                      { text: 'Total Interés a Pagar', bold: true },
                      `${Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(this.sumaInteresesF)}`,
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
          {
            aligment: 'center',
            text: '  ',
          },
          {
            aligment: 'center',
            text: '  ',
          },
          {
            style: 'tableExample',
            table: {
              layout: 'lightHorizontalLines',
              headerRows: 1,
              widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
              body: [
                [
                  {
                    text: '#Cuotas',
                    alignment: 'center',
                    fillColor: '#b40c15',
                    color: 'white',
                  },
                  {
                    text: 'Interés del Periodo',
                    alignment: 'center',
                    fillColor: '#b40c15',
                    color: 'white',
                  },
                  {
                    text: 'Capital Amortizado',
                    alignment: 'center',
                    fillColor: '#b40c15',
                    color: 'white',
                  },
                  {
                    text: 'Seguro',
                    alignment: 'center',
                    fillColor: '#b40c15',
                    color: 'white',
                  },
                  {
                    text: 'Cuota a Pagar',
                    alignment: 'center',
                    fillColor: '#b40c15',
                    color: 'white',
                  },
                  {
                    text: 'Saldo Remanente',
                    alignment: 'center',
                    fillColor: '#b40c15',
                    color: 'white',
                  },
                ],
                ...this.dataFrances.map((p) => [
                  p.numeroCuota,
                  Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(p.interesPeriodo),
                  Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(p.capitalAmortizado),
                  Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(p.seguro),
                  Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(p.cuotaPagar),
                  Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(p.saldoRemanente),
                ]),
              ],
            },
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
    } else if (this.alemana.is_visible) {
      // credito educativo Simulacion Alemana
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
                }\n Amortización Alemana`,
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
                  layout: 'lightHorizontalLines', // optional
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
                      { text: 'Monto del Prestamo', bold: true },
                      `${Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(this.valorPrestamo)}`,
                    ],
                    [
                      { text: 'Plazo (Meses)', bold: true },
                      `${this.numeroCuotas}`,
                    ],
                    [
                      { text: 'Tasa de Interés', bold: true },
                      `${this.tasaInteresAnual.toFixed(2)}%`,
                    ],
                    [
                      { text: 'Tasa Interés Periódica', bold: true },
                      `${this.tasaInteresPeriodica.toFixed(2)}`,
                    ],
                    [
                      { text: 'Tasa Interés Efectiva', bold: true },
                      `${(this.tasaEfectiva * 100).toFixed(2)}%`,
                    ],
                    [
                      { text: 'Tasa Seguro', bold: true },
                      `${this.porcentajeSD.toFixed(2)}%`,
                    ],
                    [
                      { text: 'Total Seguro a Pagar', bold: true },
                      `${Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(this.sumaSeguroDesgravamenA)}`,
                    ],
                    [
                      { text: 'Contribución SOLCA 0.5%', bold: true },
                      `${Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(this.solca)}`,
                    ],
                    [
                      { text: 'Liquido a Recibir', bold: true },
                      `${Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(this.liquidoRecibir)}`,
                    ],
                    [
                      { text: 'Cuota Inicial', bold: true },
                      `${Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(this.cuotaInicial)}`,
                    ],
                    [
                      { text: 'Total Interés a Pagar', bold: true },
                      `${Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(this.sumaIntereses)}`,
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

          {
            aligment: 'center',
            text: '  ',
          },
          {
            aligment: 'center',
            text: '  ',
          },

          {
            style: 'tableExample',
            table: {
              layout: 'lightHorizontalLines', // optional
              headerRows: 1,
              widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
              body: [
                [
                  {
                    text: '#Cuotas',
                    alignment: 'center',
                    fillColor: '#b40c15',
                    color: 'white',
                  },
                  {
                    text: 'Interés del Periodo',
                    alignment: 'center',
                    fillColor: '#b40c15',
                    color: 'white',
                  },
                  {
                    text: 'Capital Amortizado',
                    alignment: 'center',
                    fillColor: '#b40c15',
                    color: 'white',
                  },
                  {
                    text: 'Seguro',
                    alignment: 'center',
                    fillColor: '#b40c15',
                    color: 'white',
                  },
                  {
                    text: 'Cuota a Pagar',
                    alignment: 'center',
                    fillColor: '#b40c15',
                    color: 'white',
                  },
                  {
                    text: 'Saldo Remanente',
                    alignment: 'center',
                    fillColor: '#b40c15',
                    color: 'white',
                  },
                ],
                ...this.dataAleman.map((p) => [
                  p.numeroCuota,
                  Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(p.interesPeriodo),
                  Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(p.capitalAmortizado),
                  Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(p.seguro),
                  Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(p.cuotaPagar),
                  Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(p.saldoRemanente),
                ]),
              ],
            },
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
}
