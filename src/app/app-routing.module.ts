import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SimulatorsEComponent } from './simulators-e/simulators-e.component';
import {SimulatorsAdpfComponent} from './simulators-adpf/simulators-adpf.component';
import {SimulatorsAfComponent } from './simulators-af/simulators-af.component';
import {SimulatorsIpComponent} from './simulators-ip/simulators-ip.component';
import {SimulatorsVComponent} from './simulators-v/simulators-v.component';

const routes:Routes =[

  { path: 'creditoEducativo', component:SimulatorsEComponent},
  {path:'ahorroDpf',component:SimulatorsAdpfComponent},
  {path:'ahorroFlexSave',component:SimulatorsAfComponent },
  {path:'creditoInversionPersonal',component:SimulatorsIpComponent },
  {path:'creditoInversionVivienda',component:SimulatorsVComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
