import * as assert from 'assert';
import { environment } from '../environments/environment';

export const de = environment.de;

export function mand(value: any, message?: any): void {
    assert(value, message);
}

export function bug(message?: string, ...optParams: any[]): void {
    console.log(message, ...optParams);
}

export function bug_cond(cond: boolean, message?: string, ...optParams: any[]): void {
    if (cond) {
        console.log(message, ...optParams);
    }
}

