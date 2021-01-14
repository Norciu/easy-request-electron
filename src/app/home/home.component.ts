import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  title = 'easy-request-electron';
  curlCommand = '';
  httpMethods = ['GET', 'POST', 'DELETE', 'PUT'];
  protocols = ['HTTP', 'HTTPS'];
  addressForm = this.fb.group({
    address: this.fb.control('', [Validators.required]),
    port: this.fb.control('', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(5),
      Validators.pattern(/^()([1-9]|[1-5]?[0-9]{2,4}|6[1-4][0-9]{3}|65[1-4][0-9]{2}|655[1-2][0-9]|6553[1-5])$/gm),
    ]),
    httpMethod: this.fb.control('', [Validators.required]),
    protocol: this.fb.control('', [Validators.required]),
    path: this.fb.control('')
  });
  constructor(private fb: FormBuilder) {}

  isEmpty(str: string): boolean {
    return str === '';
  }

  ngOnInit(): void {
    this.addressForm.valueChanges.subscribe((x) => {
      const protocol = this.isEmpty(x.protocol) ? '' : x.protocol.toLowerCase() + '://';
      const address = x.address;
      const method = this.isEmpty(x.httpMethod) ? '' : '-X ' + x.httpMethod + ' ';
      const port = this.isEmpty(x.port) ? '' : ':' + x.port;
      const path = this.isEmpty(x.path) ? '/' : x.path;
      this.curlCommand = 'curl ' + method + protocol + address + port + x.path;
    });
  }

}
