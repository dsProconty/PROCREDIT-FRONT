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
  selector: 'app-simulators-ip',
  templateUrl: './simulators-ip.component.html',
  styleUrls: ['./simulators-ip.component.css'],
})
export class SimulatorsIpComponent implements OnInit {
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

  tasaCreditoInversion: number;
  montoMinCreditoInversion: number;
  montoMaxCreditoInversion: number;
  tiempoMinCreditoInversion: number;
  tiempoMaxCreditoInversion: number;

  /**Varibles para almacenar las consultas api de credito y ahorro */
  datosCreditoInversion = null;

  porcentajeSD = null;
  nombreProducto: string;
  itemS: number;
  checked = false;

  liquidoRecibirP: number;
  tasaEfectivaP: number;
  solcaP: number;

  cp: CurrencyPipe;


  botoncolorF=false
  botoncolorA=true

  constructor(
    private service: ClientService,
    private toastr: ToastrService,
    public dialog: MatDialog
  ) {
    this.data = [];
    this.itemS = 0;
    this.nombreProducto = 'Crédito Inversión Personal';
    this.francesa.is_visible = true;
  }

  openDialog() {
    this.dialog.open(DialogExampleComponent);
  }

  ngOnInit(): void {
    this.service.getCreditoInversion().subscribe(
      (datos) => {
        this.datosCreditoInversion = datos;
        for (let x of this.datosCreditoInversion) {
          this.tasaCreditoInversion = x.tasa;
          this.montoMinCreditoInversion = x.montomin;
          this.montoMaxCreditoInversion = x.montomax;
          this.tiempoMinCreditoInversion = x.tiempomin;
          this.tiempoMaxCreditoInversion = x.tiempomax;
        }
        this.tasaEfectivaP =
          Math.pow(1 + this.tasaCreditoInversion / 12 / 100, 12) - 1;

        //  console.log('tasainversion', this.tasaCreditoInversion);
      },
      (error) => {
        //  console.log('ERROR DE CONEXION', error);
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
    //  console.log('_selectTabChange ' + index);
  }

  _selectedIndexChange(index: number) {
    //  console.log('_selectedIndexChange ' + index);
  }
  _select(index: number) {
    //  console.log('_select ' + index);
  }

  /****************************************************************** */

  limpiarDatos(): void {
    this.botonSimulacion.is_visible = false;
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

  simuladorInversion(): void {
    this.limpiarTabla();
    /**Variables globales para los dos sistemas */
    //  this.tasaInteresAnual = this.tasaCreditoInversion;
    //  this.tasaInteresPeriodica = this.tasaInteresAnual / 12;
    //  this.porcentajeSeguroDesgravamen = 0.655 / 100;

    //  this.solcaP = (this.valorPrestamo * 0.5) / 100;
    // //  console.log('valor solca', this.solcaP);
    //  this.liquidoRecibirP = this.valorPrestamo - this.solcaP;
    /**Validacion montos y tiempo */
    if (
      this.valorPrestamo > this.montoMaxCreditoInversion ||
      this.valorPrestamo < this.montoMinCreditoInversion
    ) {
      this.valorPrestamo = this.montoMinCreditoInversion;

      this.toastr.warning(
        `Monto máximo $${this.transform( this.montoMaxCreditoInversion)},
       monto mínimo $${this.transform(this.montoMinCreditoInversion)} `,
        'Monto fuera de rango',
        {
          timeOut: 4500,
        }
      );
    } else if (
      this.numeroCuotas > this.tiempoMaxCreditoInversion ||
      this.numeroCuotas < this.tiempoMinCreditoInversion
    ) {
      this.numeroCuotas = this.tiempoMinCreditoInversion;
      this.toastr.warning(
        `Tiempo máximo ${this.tiempoMaxCreditoInversion} meses tiempo mínimo ${this.tiempoMinCreditoInversion} meses`,
        'Tiempo fuera de rango',
        {
          timeOut: 4500,
        }
      );
    } else {
      this.tasaInteresAnual = this.tasaCreditoInversion;
      this.tasaInteresPeriodica = this.tasaInteresAnual / 12;
      this.porcentajeSeguroDesgravamen = 0.655 / 100;

      this.solcaP = (this.valorPrestamo * 0.5) / 100;
      //  console.log('valor solca', this.solcaP);
      this.liquidoRecibirP = this.valorPrestamo - this.solcaP;
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
      }
      //  console.log('suma seguro d', this.sumaSeguroDesgravamenF);

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
      //  console.log('interes aleman primera cuota', this.interesDelPeriodoIA);
      this.cuotaInicial = this.cuotaPagarIA;
      for (let i = 0; i < this.numeroCuotas; i++) {
        /**Calculo Aleman */
        // this.valorSeguroDesgravamen = this.saldoRemanenteIA * this.porcentajeSeguroDesgravamen / 12;
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

  /************************************** */
  //Funciones para Guardar el formulario de cliente mediante el api
  new() {
    this.current_clien = new Client();
    this.crud_operation.is_visible = true;
    this.crud_operation.is_new = true;

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
    //  console.log(event.value);
    this.valorPrestamo = event.value;
  }

  onInputChangeTiempo(event: any) {
    //  console.log(event.value);
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
  currencyPipeString: string;
  transformdValue: any;
  formatedOutputValue: any;

  async generatePDF(action = 'download') {
    if (this.itemS == 0 && this.francesa.is_visible) {
      // this.formatedOutputValue = CurrencyPipe.transform(this.valorPrestamo, 'USD', 'symbol', '1.2-2');

      //credito educativo
      let docDefinition = {
        footer: {
          columns: [
            {
              // width:'*',
              image: await this.getBase64ImageFromURL(
                '../../assets/images/footer3Pdf.PNG'
                // "https://images.pexels.com/photos/209640/pexels-photo-209640.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=300"
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
                // "https://images.pexels.com/photos/209640/pexels-photo-209640.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=300"
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
                  // "https://images.pexels.com/photos/209640/pexels-photo-209640.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=300"
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
                      `${(this.tasaEfectivaP * 100).toFixed(2)}%`,
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
                      }).format(this.solcaP)}`,
                    ],

                    [
                      { text: 'Liquido a Recibir', bold: true },
                      `${Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(this.liquidoRecibirP)}`,
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
              // {text: ' ', fontSize: 14, bold: true, margin: [0, 20, 0, 8]},
              {
                table: {
                  // layout: 'lightHorizontalLines',
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
          // {
          //   table: {
          //     layout: 'lightHorizontalLines',
          //     headerRows: 1,
          //     widths: ['auto', 'auto'],
          //     body: [
          //       [{ text: 'Detalles Simulación', alignment: 'center', fillColor: '#b40c15', color: 'white', colSpan: 2 }, {}],
          //       [{ text: 'Monto del Préstamo', bold: true }, `${Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(this.valorPrestamo)}`],
          //       [{ text: 'Plazo (Meses)', bold: true }, `${this.numeroCuotas}`],
          //       [{ text: 'Tasa de Interés', bold: true }, `${this.tasaInteresAnual.toFixed(2)}%`],
          //       [{ text: 'Tasa Interés Periódica', bold: true }, `${this.tasaInteresPeriodica.toFixed(2)}%`],
          //       [{ text: 'Tasa Interés Efectiva', bold: true }, `${(this.tasaEfectivaP*100).toFixed(2)}%`],
          //       [{ text: 'Tasa Seguro', bold: true }, `${this.porcentajeSD.toFixed(3)}%`],
          //       [{ text: 'Total Seguro a Pagar', bold: true }, `${Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(this.sumaSeguroDesgravamenF)}`],
          //       [{ text: 'Contribución SOLCA 0.5%', bold: true }, `${Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(this.solcaP)}`],

          //       [{ text: 'Liquido a Recibir', bold: true }, `${Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(this.liquidoRecibirP)}`],
          //       [{ text: 'Cuota a Pagar Periódicamente', bold: true }, `${Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(this.cuotaPagarF)}`],
          //       [{ text: 'Total Interés a Pagar', bold: true }, `${Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(this.sumaInteresesF)}`],
          //     ]
          //   }
          // },
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
          // {
          //   aligment: 'center',
          //   text: 'Visita Nuestra Página Web',
          // },
          // {
          //   aligment: 'center',
          //   text: '  ',
          // },
          // {
          //   columns: [
          //     [{ qr: `https://www.bancoprocredit.com.ec/`, fit: '100' }],
          //   ]
          // },
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
    } else if (this.itemS == 0 && this.alemana.is_visible) {
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
                      `${this.tasaInteresPeriodica.toFixed(2)}`,
                    ],
                    [
                      { text: 'Tasa Interés Efectiva', bold: true },
                      `${(this.tasaEfectivaP * 100).toFixed(2)}%`,
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
                      }).format(this.solcaP)}`,
                    ],
                    [
                      { text: 'Liquido a Recibir', bold: true },
                      `${Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(this.liquidoRecibirP)}`,
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
