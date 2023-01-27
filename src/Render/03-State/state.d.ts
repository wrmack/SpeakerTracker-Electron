import { Entity } from '../02-Models/models.js'

export let masterRowIdx: number;
export function setMasterRowIdx(idx: number): void;
export let selectedEntityId: number;
export function setSelectedEntityId(id: number): Promise<void>;
export let selectedGroupId: number;
export function setSelectedGroupId(id: number): Promise<void>;
export function setCurrentEntGroupEvtId(entIdx: number, grpIdx: number, evtIdx: number): Promise<void>;
export function setSelectedEventDate(date: string): void;
export function getSavedEntGroupId(): Promise<{
    entId: any;
    grpId: any;
}>;
export function getSelectedEventDate(): string;
export function setShowIndividualTimers(showTimer: boolean): void;
export let showIndividualTimers: boolean;