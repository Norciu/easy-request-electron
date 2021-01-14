import { Component, OnInit } from "@angular/core";
import { ElectronService } from "./core/services";
import { FormBuilder, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";

export interface AddressForm<T> {
  address: T,
  port: T,
  method: T,
  protocol: T,
  path: T,
}

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  title = "easy-request-electron";
  curlCommand = "";
  subscribeState: string;
  httpMethods = ["GET", "POST", "DELETE", "PUT"];
  protocols = ["HTTP", "HTTPS"];
  addressForm = this.fb.group({
    address: this.fb.control("", [Validators.required]),
    port: this.fb.control("", [
      Validators.minLength(1),
      Validators.maxLength(5),
      Validators.pattern(
        /^()([1-9]|[1-5]?[0-9]{2,4}|6[1-4][0-9]{3}|65[1-4][0-9]{2}|655[1-2][0-9]|6553[1-5])$/gm
      ),
    ]),
    httpMethod: this.fb.control("", [Validators.required]),
    protocol: this.fb.control("", [Validators.required]),
    path: this.fb.control(""),
  });
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private electronService: ElectronService
  ) {}

  isEmpty(str: string): boolean {
    return str === "";
  }

  ngOnInit(): void {
    this.addressForm.valueChanges.subscribe((x) => {
      const protocol = this.isEmpty(x.protocol)
        ? ""
        : x.protocol.toLowerCase() + "://";
      const address = x.address;
      const method = this.isEmpty(x.httpMethod)
        ? ""
        : "-X " + x.httpMethod + " ";
      const port = this.isEmpty(x.port) ? "" : ":" + x.port;
      const path = this.isEmpty(x.path) ? "/" : x.path;
      this.curlCommand = "curl " + method + protocol + address + port + x.path;
    });
  }

  testApi() {
    this.sendRequest().subscribe((val) => {
      this.subscribeState = JSON.stringify(val);
    });
  }

  sendRequest(): Observable<object> {
    const method = this.addressForm.controls.httpMethod.value;
    console.log(method);
    if (method === "GET") {
      return this.http.get(this.endpoint).pipe(
        catchError((e) => {
          throw new Error(e);
        })
      );
    } else if (method === "POST") {
      return this.http.post(this.endpoint, {}).pipe(
        catchError((e) => {
          throw new Error(e);
        })
      );
    } else if (method === "PUT") {
      return this.http.put(this.endpoint, {}).pipe(
        catchError((e) => {
          throw new Error(e);
        })
      );
    } else if (method === "DELETE") {
      return this.http.delete(this.endpoint, {}).pipe(
        catchError((e) => {
          throw new Error(e);
        })
      );
    }
  }

  get endpoint(): string {
    const form: AddressForm<string> = this.form;
    return `${form.protocol + form.address + form.port + form.path}`;
  }

  get form(): AddressForm<string> {
    const x = this.addressForm.value;
    return {
      protocol: this.isEmpty(x.protocol)
        ? ""
        : x.protocol.toLowerCase() + "://",
      address: x.address,
      method: this.isEmpty(x.httpMethod) ? "" : "-X " + x.httpMethod + " ",
      port: this.isEmpty(x.port) ? "" : ":" + x.port,
      path: this.isEmpty(x.path) ? "/" : x.path,
    };
  }
}
