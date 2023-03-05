/// <reference path="./interfaces.d.ts" />

import { Entity, Group, GroupEvent } from './interfaces'

export function execSql(mysql: string): Promise<void>;
export function getEntities(): Promise<any>;
export function getEntityAtIdx(idx: number): Promise<Entity>;
export function getEntityWithId(id: number): Promise<Entity>;
export function deleteEntityWithId(id: number): Promise<void>;
export function getMembersForCurrentEntity(): Promise<any>;
export function getMemberAtIdx(idx: number): Promise<any>;
export function getMemberWithId(id: number): Promise<{
    Id: number;
    Title: string;
    FirstName: string;
    LastName: string;
    Entity: number;
}>;
export function getMembersForEntityId(entityId: number): Promise<any>;
export function addMember(member: any): Promise<void>;
export function addGroup(group: any): Promise<any>;
export function addEvent(eventDate: string, groupId: number): Promise<void>;
export function addDebateSpeech(memberId: number, startTime: string, seconds: number, sectionId: number): Promise<void>;
export function getMembersForGroupId(id: number): Promise<any>;
export function getGroupAtIdx(idx: number): Promise<any>;
export function getGroupForId(id: number): Promise<Group>;
export function getGroupsForCurrentEntity(): Promise<any>;
export function getGroupIdsForEntityId(id: number): Promise<any>;
export function getGroupsForEntityId(id: number): Promise<any>;
export function groupIdExists(id: number): Promise<boolean>;
export function entityIdExists(id: number): Promise<boolean>;
export function getEventsForCurrentGroup(): Promise<GroupEvent[]>;
export function getOpenEventAtIdx(idx: number): Promise<GroupEvent>;