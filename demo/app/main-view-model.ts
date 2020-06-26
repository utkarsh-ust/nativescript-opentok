import * as frame from 'ui/frame';
import { Observable, fromObject } from "tns-core-modules/data/observable";
import {isAndroid, isIOS} from 'platform';
import * as utils from "utils/utils";
import {Page} from 'ui/page';
import * as dialogs from "ui/dialogs";
import {TNSOTSession, TNSOTPublisher, TNSOTSubscriber} from 'nativescript-opentok';
const M = 23;
var android;
export class Demo extends Observable {

    public _apiKey:string = '46711472';
    private _sessionId: string = '2_MX40NjcxMTQ3Mn5-MTU5MjE0MDI0MDIyNX5IWHZMd2N4anZ5dzdSb3VmTEREUWsxa1B-fg';
    private _subscriberToken: string =  "T1==cGFydG5lcl9pZD00NjcxMTQ3MiZzaWc9ZDJkMTc5OTI2ZTJhN2YzOTFlNDQzMDE1MTBlMTg2NDI3OTVhNzg3NjpzZXNzaW9uX2lkPTJfTVg0ME5qY3hNVFEzTW41LU1UVTVNakUwTURJME1ESXlOWDVJV0haTWQyTjRhblo1ZHpkU2IzVm1URVJFVVdzeGExQi1mZyZjcmVhdGVfdGltZT0xNTkyMTQwMjU5Jm5vbmNlPTAuNDMxNzYzNzE4NDM2OTc4NyZyb2xlPXB1Ymxpc2hlciZleHBpcmVfdGltZT0xNTkyMTQzODU4JmluaXRpYWxfbGF5b3V0X2NsYXNzX2xpc3Q9"
    //private _publisherToken: string = "T1==cGFydG5lcl9pZD00NjcxMTQ3MiZzaWc9NjRiNTVjNzIwODEzODQ4ZmNiYzNhZTliMmJmNzNkYjljM2IwYmZmZjpzZXNzaW9uX2lkPTJfTVg0ME5qY3hNVFEzTW41LU1UVTVNakUwTURJME1ESXlOWDVJV0haTWQyTjRhblo1ZHpkU2IzVm1URVJFVVdzeGExQi1mZyZjcmVhdGVfdGltZT0xNTkyMTY2NTc1Jm5vbmNlPTAuMzAzMTQ1OTA3NDQwMDA3MzYmcm9sZT1wdWJsaXNoZXImZXhwaXJlX3RpbWU9MTU5NDc1ODU3NCZpbml0aWFsX2xheW91dF9jbGFzc19saXN0PQ=="
    private _publisherToken: string =  "T1==cGFydG5lcl9pZD00NjcxMTQ3MiZzaWc9YzZmNzkzMjAwYTU1NzU4YTJjY2Q3Y2Y2ZDQ2ODBmZTcxNjI1NTc1MTpzZXNzaW9uX2lkPTJfTVg0ME5qY3hNVFEzTW41LU1UVTVNakUwTURJME1ESXlOWDVJV0haTWQyTjRhblo1ZHpkU2IzVm1URVJFVVdzeGExQi1mZyZjcmVhdGVfdGltZT0xNTkyMTY2NTEzJm5vbmNlPTAuMTM4NTA4NDA1OTkwNjc5MTUmcm9sZT1wdWJsaXNoZXImZXhwaXJlX3RpbWU9MTU5NDc1ODUxMiZpbml0aWFsX2xheW91dF9jbGFzc19saXN0PQ=="  
    private publisher: TNSOTPublisher;
    private subscriber: TNSOTSubscriber;

    private session: TNSOTSession;

    constructor(private page: Page) {
        super();
        this.session = TNSOTSession.initWithApiKeySessionId(this._apiKey, this._sessionId);
        this.publisher = <TNSOTPublisher> this.page.getViewById('publisher');
        this.subscriber = <TNSOTSubscriber> this.page.getViewById('subscriber');
        this.session.subscriber = this.subscriber;
        this.publisher.events.on('streamCreated',(data:any)=>{
            this.subscriber.subscribe(this.session,data.object.stream);
        });
        this.session.events.on('signalReceived',(data:any)=>{
            alert("signal received");
            console.dir(data);
        }); 
    }

    publish() {
        if(isAndroid){
            if(android.os.Build.VERSION.SDK_INT >= M){
                TNSOTSession.requestPermission().then((granted)=>{
                    this.session.connect(this._publisherToken);
                    this.publisher.publish(this.session, '', 'HIGH', '30');
                },(e)=>{
                    if(e && e["android.permission.CAMERA"]){
                        dialogs.alert({
                            title:"Permission Required",
                            message:"This is required to broadcast your video feed.",
                            okButtonText:"OK"
                        })
                    }

                    if(e && e["android.permission.RECORD_AUDIO"]){
                        dialogs.alert({
                            title:"Permission Required",
                            message:"This is required to broadcast your audio feed.",
                            okButtonText:"OK"
                        })
                    }
                });
            }else{
                this.session.connect(this._publisherToken);
                this.publisher.publish(this.session, '', 'HIGH', '30');
            }
        }else{
            this.session.connect(this._publisherToken);
            this.publisher.publish(this.session, '', 'HIGH', '30');
        }

    }

    switchCamera() {
        this.publisher.cycleCamera();
    }

    toggleVideo() {
        this.publisher.toggleCamera()
    }

    toggleMute() {
        this.publisher.toggleMute();
    }

    unpublish() {
        this.publisher.unpublish(this.session);
    }

    unsubscribe() {
        this.subscriber.unsubscribe(this.session);
    }

    subscriberConnect(){
        this.session.connect(this._subscriberToken);
    }

    disconnect() {
        this.session.disconnect();
    }

    sendSignal() {
        this.session.sendSignal('chat', 'hello');
    }

}