
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
export enum TimerButtonMode {
    play = 0,
    pause_stop = 1,
    play_stop = 2,
    off = 3
}
export enum SectionType {
    mainDebate = 0,
    amendment = 1,
    off = 2
}
export interface SectionList {
    sectionNumber: number;
    sectionType: SectionType;
    sectionHeader: string;
    sectionMembers: ListMember[];
}
export interface SpeakingTable {
    id: number;
    sectionLists: SectionList[];
}
export interface Member {
    id: number;
    title: string;
    firstName: string;
    lastName: string;
}
export interface ListMember {
    row: number;
    member: Member;
    startTime: Date | null;
    speakingTime: number;
    timerButtonMode: TimerButtonMode;
    timerIsActive: boolean;
}
export function getEventsForCurrentGroup(): Promise<GroupEvent[]>;
export function getEventAtIdx(idx: number): Promise<GroupEvent>;
export interface Entity {
    Id: number;
    EntName: string;
}
interface Group {
    Id: number;
    GrpName: string;
    Entity: number;
}
interface GroupEvent {
    Id: number;
    GroupId: number;
    EventDate: string;
}
export {};