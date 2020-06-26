import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, NgZone } from "@angular/core";

import { TNSOTPublisher, TNSOTSubscriber, TNSOTSession } from "nativescript-opentok";
import * as platform from "tns-core-modules/platform";
import { Page, View } from "@nativescript/core/ui/page";


const application = require("tns-core-modules/application");
const permissions = require( "nativescript-permissions" );

@Component({
    selector: "Home",
    templateUrl: "./home.component.html"
})
export class HomeComponent implements OnInit, AfterViewInit {

  @ViewChild("container", { static: false }) container: ElementRef;


  apiKey:string = '46711472';
  sessionId: string = '2_MX40NjcxMTQ3Mn5-MTU5MjE0MDI0MDIyNX5IWHZMd2N4anZ5dzdSb3VmTEREUWsxa1B-fg';
  subscriberToken: string =  "T1==cGFydG5lcl9pZD00NjcxMTQ3MiZzaWc9ZDJkMTc5OTI2ZTJhN2YzOTFlNDQzMDE1MTBlMTg2NDI3OTVhNzg3NjpzZXNzaW9uX2lkPTJfTVg0ME5qY3hNVFEzTW41LU1UVTVNakUwTURJME1ESXlOWDVJV0haTWQyTjRhblo1ZHpkU2IzVm1URVJFVVdzeGExQi1mZyZjcmVhdGVfdGltZT0xNTkyMTQwMjU5Jm5vbmNlPTAuNDMxNzYzNzE4NDM2OTc4NyZyb2xlPXB1Ymxpc2hlciZleHBpcmVfdGltZT0xNTkyMTQzODU4JmluaXRpYWxfbGF5b3V0X2NsYXNzX2xpc3Q9"
  publisherToken: string = "T1==cGFydG5lcl9pZD00NjcxMTQ3MiZzaWc9NjRiNTVjNzIwODEzODQ4ZmNiYzNhZTliMmJmNzNkYjljM2IwYmZmZjpzZXNzaW9uX2lkPTJfTVg0ME5qY3hNVFEzTW41LU1UVTVNakUwTURJME1ESXlOWDVJV0haTWQyTjRhblo1ZHpkU2IzVm1URVJFVVdzeGExQi1mZyZjcmVhdGVfdGltZT0xNTkyMTY2NTc1Jm5vbmNlPTAuMzAzMTQ1OTA3NDQwMDA3MzYmcm9sZT1wdWJsaXNoZXImZXhwaXJlX3RpbWU9MTU5NDc1ODU3NCZpbml0aWFsX2xheW91dF9jbGFzc19saXN0PQ=="
  //publisherToken: string =  "T1==cGFydG5lcl9pZD00NjcxMTQ3MiZzaWc9YzZmNzkzMjAwYTU1NzU4YTJjY2Q3Y2Y2ZDQ2ODBmZTcxNjI1NTc1MTpzZXNzaW9uX2lkPTJfTVg0ME5qY3hNVFEzTW41LU1UVTVNakUwTURJME1ESXlOWDVJV0haTWQyTjRhblo1ZHpkU2IzVm1URVJFVVdzeGExQi1mZyZjcmVhdGVfdGltZT0xNTkyMTY2NTEzJm5vbmNlPTAuMTM4NTA4NDA1OTkwNjc5MTUmcm9sZT1wdWJsaXNoZXImZXhwaXJlX3RpbWU9MTU5NDc1ODUxMiZpbml0aWFsX2xheW91dF9jbGFzc19saXN0PQ=="
  publisher: TNSOTPublisher;
  subscriber: TNSOTSubscriber;
  session: TNSOTSession;

  constructor(protected page: Page, private zone: NgZone) {
    console.log( "sart" )
    this.session = TNSOTSession.initWithApiKeySessionId(this.apiKey, this.sessionId);
    console.log( this.session )

  }

  initOT() {
    console.log( "initOT" )
    this.publisher = <TNSOTPublisher> this.page.getViewById('publisher');
    console.log( this.publisher )
    this.subscriber = <TNSOTSubscriber> this.page.getViewById('subscriber');
    console.log( this.subscriber )
    this.session.subscriber = this.subscriber;



    this.session.events.on('signalReceived',(data:any)=>{
      console.log( "signalReceived" )
        alert("signal received");
        console.dir(data);
    }); 

  }

  publish() {
    console.log( "publish" )
      if(platform.isAndroid){
          if(android.os.Build.VERSION.SDK_INT >= 23){
              TNSOTSession.requestPermission().then((granted)=>{
                  this.session.connect(this.publisherToken);

                  console.log( "publishing..." )
                  this.publisher.publish(this.session, '', 'HIGH', '30');
              },(e)=>{
                  if(e && e["android.permission.CAMERA"]){
                      alert({
                          title:"Permission Required",
                          message:"This is required to broadcast your video feed.",
                          okButtonText:"OK"
                      })
                  }

                  if(e && e["android.permission.RECORD_AUDIO"]){
                      alert({
                          title:"Permission Required",
                          message:"This is required to broadcast your audio feed.",
                          okButtonText:"OK"
                      })
                  }
              });
          }else{
              this.session.connect(this.publisherToken);
              this.publisher.publish(this.session, '', 'HIGH', '30');
          }
      }else{
          this.session.connect(this.publisherToken);
          this.publisher.publish(this.session, '', 'HIGH', '30');
      }

  }

  switchCamera() {
    console.log( "switchCamera..." )
      this.publisher.cycleCamera();
  }

  toggleVideo() {
    console.log( "toggleVideo..." )
      this.publisher.toggleCamera()
  }

  toggleMute() {
    console.log( "toggleMute..." )
      this.publisher.toggleMute();
  }

  unpublish() {
    console.log( "unpublish..." )
      this.publisher.unpublish(this.session);
  }

  unsubscribe() {
    //  this.subscriber.unsubscribe(this.session);
  }

  subscriberConnect(){
    console.log( "subscriberConnect..." )
      this.session.connect(this.subscriberToken);
  }

  disconnect() {
      this.session.disconnect();
  }

  sendSignal() {
      this.session.sendSignal('chat', 'hello');
  }




  ngOnInit(): void {
    
  } 

  ngAfterViewInit() {
    
    this.initOT();

  }

  

  getPermissions(){
    let perms = [android.Manifest.permission.CAMERA,
      android.Manifest.permission.RECORD_AUDIO,
      android.Manifest.permission.WRITE_EXTERNAL_STORAGE,
      android.Manifest.permission.READ_PHONE_STATE,
      android.Manifest.permission.ACCESS_NETWORK_STATE ]

    return permissions.requestPermissions(perms);

  }

    
}
