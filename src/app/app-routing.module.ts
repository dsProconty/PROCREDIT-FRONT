import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SimulatorsEComponent } from './simulators-e/simulators-e.component';
import { SimulatorsComponent } from './simulators/simulators.component';
import {SimulatorsAdpfComponent} from './simulators-adpf/simulators-adpf.component';
import {SimulatorsAfComponent } from './simulators-af/simulators-af.component';
import {SimulatorsIpComponent} from './simulators-ip/simulators-ip.component';

import {SimulatorsVComponent} from './simulators-v/simulators-v.component';



const routes:Routes =[
// [
  { path: '', component:SimulatorsComponent},

  { path: 'creditoEducativo', component:SimulatorsEComponent},
  {path:'ahorroDpf',component:SimulatorsAdpfComponent},
  {path:'ahorroFlexSave',component:SimulatorsAfComponent },
  {path:'creditoInversionPersonal',component:SimulatorsIpComponent },
  {path:'creditoInversionVivienda',component:SimulatorsVComponent }



// {
//   path: '/educativo',
//   loadChildren: () => import('./simulators-e/simulators-e.component').then(m => m.SimulatorsEComponent),
// },
// {path:'simuladores',component:SimulatorsComponent}
];



@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
