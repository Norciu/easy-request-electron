import { Component, OnInit } from "@angular/core";
import { ElectronService } from "./core/services";
import { FormBuilder, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import {Observable, throwError} from "rxjs";
import { catchError } from "rxjs/operators";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {AuthorComponent} from "./author/author.component";

export interface AddressForm<T> {
  address: T,
  port: T,
  method: T,
  protocol: T,
  path: T,
  body: object
}

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  subscribeStatus: boolean;
  title = "easy-request-electron";
  curlCommand = "";
  subscribeState: object;
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
    body: this.fb.control("", [Validators.pattern(/^{.*}$/gmi)])
  });
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private electronService: ElectronService,
    private snack: MatSnackBar,
    private dialog: MatDialog
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
      this.subscribeStatus = true;
      this.subscribeState = val;
    });
  }

  sendRequest(): Observable<object> {
    const method = this.addressForm.controls.httpMethod.value;
    console.log(method)
    this.snack.open('Wysłano zapytanie!', null, {duration: 1000})
    if (method === "GET") {
      return this.http.get(this.endpoint).pipe(
        catchError((e) => {
          throw this.err(e);
        })
      );
    } else if (method === "POST") {
      return this.http.post(this.endpoint, this.form.body).pipe(
        catchError((e) => {
          throw this.err(e);
        })
      );
    } else if (method === "PUT") {
      return this.http.put(this.endpoint, this.form.body).pipe(
        catchError((e) => {
          throw this.err(e);
        })
      );
    } else if (method === "DELETE") {
      return this.http.delete(this.endpoint, this.form.body).pipe(
        catchError((e) => {
          throw this.err(e);
        })
      );
    }
  }

  private err(err: any): Error {
    this.subscribeState = err;
    this.subscribeStatus = false
    throw new Error(err);
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
      body: this.isEmpty(x.body) ? {} : x.body,
    };
  }

  openDialog(): MatDialogRef<AuthorComponent> {
    return this.dialog.open(AuthorComponent);
  }
}
