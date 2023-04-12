import { TNSOTSessionI } from '../common';
import { TNSOTPublisher } from './publisher';

import { Observable, fromObject } from 'tns-core-modules/data/observable';
import * as utils from "tns-core-modules/utils/utils";
declare var com: any, android: any;
const Session = com.opentok.android.Session;
const Subscriber = com.opentok.android.Subscriber;
const Publisher = com.opentok.android.Publisher;
const BaseVideoRenderer = com.opentok.android.BaseVideoRenderer;
const AbsoluteLayout = android.widget.AbsoluteLayout;
const RelativeLayout = android.widget.RelativeLayout;


const SessionListener = com.opentok.android.Session.SessionListener;
const SignalListener = com.opentok.android.Session.SignalListener;
const ReconnectionListener = com.opentok.android.Session.ReconnectionListener;
const ConnectionListener = com.opentok.android.Session.ConnectionListener;
const ArchiveListener = com.opentok.android.Session.ArchiveListener;
const MARSHMALLOW = 23;
const ANDROID_12 = 31;
const currentapiVersion = android.os.Build.VERSION.SDK_INT;
import { TNSOTSubscriber } from "./subscriber";
var permissions = require('nativescript-permissions');

export var ActiveSession: TNSOTSession;

export class TNSOTSession {
    private apiKey: string;
    private config: any;
    public session: any;
    public publisher: any;
    private _sessionEvents: Observable;
    private options: any;
    private _subscriber: TNSOTSubscriber;

    public static initWithApiKeySessionId(apiKey: string, sessionId: string) {
        let tnsSession = new TNSOTSession();
        ActiveSession = tnsSession
        tnsSession._sessionEvents = new Observable();
        tnsSession.apiKey = apiKey;
        tnsSession.session = new Session(utils.ad.getApplicationContext(), apiKey, sessionId);
        tnsSession.session.setSessionListener(new SessionListener({
            onConnected(session: any) {
                if (tnsSession._sessionEvents) {
                    tnsSession._sessionEvents.notify({
                        eventName: 'sessionDidConnect',
                        object: fromObject({
                            session: session
                        })
                    });
                }
            },
            onDisconnected(session: any) {
                if (tnsSession._sessionEvents) {
                    tnsSession._sessionEvents.notify({
                        eventName: 'sessionDidDisconnect',
                        object: fromObject({
                            session: session
                        })
                    });
                }
            },
            onError(session: any, error: any) {
                if (tnsSession._sessionEvents) {
                    tnsSession._sessionEvents.notify({
                        eventName: 'didFailWithError',
                        object: fromObject({
                            session: session,
                            error: error
                        })
                    });
                }
            },
            onStreamDropped(session: any, stream: any) {
                if (tnsSession._sessionEvents) {
                    tnsSession._sessionEvents.notify({
                        eventName: 'streamDropped',
                        object: fromObject({
                            session: session,
                            stream: stream,
                            streamName: stream.getName(),
                            streamId: stream.getStreamId(),
                        })
                    })
                }
            },
            onStreamReceived(session: any, stream: any) {
                if (tnsSession._sessionEvents) {
                    tnsSession._sessionEvents.notify({
                        eventName: 'streamReceived',
                        object: fromObject({
                            session: session,
                            stream: stream,
                            streamName: stream.getName(),
                            streamId: stream.getStreamId(),
                        })
                    });
                }
                if (tnsSession.subscriber) {
                    tnsSession.subscriber.subscribe(session, stream);
                }
            }

        }));

        tnsSession.session.setSignalListener(new SignalListener({
            onSignalReceived(session: any, type: any, data: any, connection: any) {
                if (tnsSession._sessionEvents) {
                    tnsSession._sessionEvents.notify({
                        eventName: 'signalReceived',
                        object: fromObject({
                            session: session,
                            type: type,
                            data: data,
                            connection: connection
                        })
                    });
                }
            }

        }));

        tnsSession.session.setArchiveListener(new ArchiveListener({
            onArchiveStarted(session: any, id: any, name: any) {
                if (tnsSession._sessionEvents) {
                    tnsSession._sessionEvents.notify({
                        eventName: 'archiveStartedWithId',
                        object: fromObject({
                            session: session,
                            archiveId: id,
                            name: name
                        })
                    });
                }
            }, onArchiveStopped(session: any, id: any) {
                if (tnsSession._sessionEvents) {
                    tnsSession._sessionEvents.notify({
                        eventName: 'archiveStoppedWithId',
                        object: fromObject({
                            session: session,
                            archiveId: id
                        })
                    });
                }
            }
        }));
        tnsSession.session.setConnectionListener(new ConnectionListener({
            onConnectionCreated(session: any, connection: any) {
                if (tnsSession._sessionEvents) {
                    tnsSession._sessionEvents.notify({
                        eventName: 'connectionCreated',
                        object: fromObject({
                            session: session,
                            connection: connection
                        })
                    })
                }
            },
            onConnectionDestroyed(session: any, connection: any) {
                if (tnsSession._sessionEvents) {
                    tnsSession._sessionEvents.notify({
                        eventName: 'connectionDestroyed',
                        object: fromObject({
                            session: session,
                            connection: connection
                        })
                    })
                }
            }
        }));
        tnsSession.session.setReconnectionListener(new ReconnectionListener({
            onReconnected(session) {
                if (tnsSession._sessionEvents) {
                    tnsSession._sessionEvents.notify({
                        eventName: 'sessionDidReconnect',
                        object: fromObject({
                            session: session
                        })
                    })
                }
            }, onReconnecting(session) {
                if (tnsSession._sessionEvents) {
                    tnsSession._sessionEvents.notify({
                        eventName: 'sessionDidBeginReconnecting',
                        object: fromObject({
                            session: session
                        })
                    })
                }
            }
        }));

        return tnsSession;
    }
    public static requestPermission(): any {
        let perms;
        if (currentapiVersion >= MARSHMALLOW && currentapiVersion >= ANDROID_12) {
            perms = [android.Manifest.permission.CAMERA, android.Manifest.permission.RECORD_AUDIO , android.Manifest.permission.READ_PHONE_STATE];
        }else if(currentapiVersion >= MARSHMALLOW ){
            perms = [android.Manifest.permission.CAMERA, android.Manifest.permission.RECORD_AUDIO];
        }
        return permissions.requestPermission(perms);
    }

    /**
     * Asynchronously begins the session connect process. Some time later, we will
     * expect a delegate method to call us back with the results of this action.
     *
     * @param {string} token The OpenTok token to join an existing session
     * @returns {Promise<any>}
     */
    public connect(token: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let session = this.session;
            if (session) {
                try {
                    session.connect(token);
                    resolve(true);
                } catch (err) {
                    reject(err);
                }
            }
        });
    }

    public disconnect(): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                this.session.disconnect();
                resolve();
            } catch (err) {
                reject(err)
            }
        });
    }

    public sendSignal(type: string, message: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let session = this.session;
            if (session) {
                try {
                    session.sendSignal(type, message);
                    resolve(true);
                } catch (err) {
                    reject(err);
                }

            }
        });

    }

    public subscribe(subInstance: any) {
        this.session.subscribe(subInstance);
    }

    get sessionEvents(): Observable {
        return this._sessionEvents;
    }

    get events(): Observable {
        return this._sessionEvents;
    }

    set subscriber(subscriber) {
        this._subscriber = subscriber;
    }

    get subscriber() {
        return this._subscriber;
    }

}