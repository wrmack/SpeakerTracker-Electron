export interface MyAPI {
  
    /** Connect to database */
    connect: () => Promise<void>;
    
    /** Initialise database with empty tables if they don't exist */
    initDb: () =>  Promise<void>;
    close: () => void;
    
    /** Runs SQL statements (can be more than one) in a string with no results returned.
     * 
     * node-sqlite3 API: db.exec wrapped in db.serialize  */ 
    execSQL: (arg0: string) =>  Promise<void>;
    
    /** Runs the SQL query with the specified parameters and 
     * calls the callback afterwards if there is an error. 
     * 
     * node-sqlite3 API: db.run.*/
    runSQL: (sql: string, params: any) =>  Promise<void>;
  
    /** Runs the SQL query with the specified parameters and calls 
     * the callback with all result rows afterwards. 
     * 
     * node-sqlite3 API: db.all wrapped in db.serialize.*/ 
    selectAll: (sql: string, val?: never[]) => Promise<any[]>;
  
    getPaths: () => {userData: string, appData: string, logs: string, appPath: string };
}

/**
 * 
 * Models for managing data for speaking table - they do not mirror database
 * 
 */

declare enum TimerButtonMode {
    play = 0,
    pause_stop = 1,
    play_stop = 2,
    off = 3
}

declare enum SectionType {
    mainDebate = 0,
    amendment = 1,
    off = 2
}

interface ListMember {
    row: number;
    member: Member;
    startTime: Date | null;
    speakingTime: number;
    timerButtonMode: TimerButtonMode;
    timerIsActive: boolean;
}

interface SectionList {
    sectionNumber: number;
    sectionType: SectionType;
    sectionHeader: string;
    sectionMembers: ListMember[];
}

interface SpeakingTable {
    id: number;
    sectionLists: SectionList[];
}


/**
 * 
 * Models for entity, group, member which mirror database
 * 
 */

// Property labels uppercase consistent with database field names
interface Entity {
    Id: number,
    EntName: string
  }
  
// Property labels lowercase - legacy so cannot change this witout affecting users who have already installed the app
interface Member {
  id: number,
  title: string,
  firstName: string,
  lastName: string
}

interface Group {
  Id: number,
  GrpName: string,
  Entity: number
}


/**
 * 
 * Models for meeting events, which mirror database
 * 
 */


// Use GroupEvent to avoid clash with in-built Event
interface GroupEvent {
  Id: number,
  GroupId: number,
  EventDate: string,
  Closed: boolean
}

interface Debate {
  Id: number,
  EventId: number,
  DebateNumber: number,
  Note: string
}

interface DebateSection {
  Id: number,
  EventId: number,
  DebateNumber: number,
  SectionNumber: number,
  SectionName: string
}

interface DebateSpeech {
  Id: number,
  DebateNumber: number,
  SectionNumber: number,
  MemberId: number,
  StartTime: string,
  Seconds: number
}



/**
 * 
 * Report view models - mirror what the app displays to the user
 * 
 */

// For displaying report cards in detail view
interface ReportEventViewModel {
  EventId: number,
  GroupName: string,
  Date: string
}

// Following are for displaying the details of the clicked report card

// At the top level - the report requires the meeting group name, the date and the array of debates
interface ReportDetailsViewModel {
  MeetingGroupName: string,
  Date: string,
  Debates: DebateViewModel[],
}

/**
 * Each debate has a note and an array of sections
 * @property {string} DebateNote
 * @property {DebateSectionViewModel[]} DebateSections
 *  */ 
interface DebateViewModel {
  DebateNote: string,
  DebateSections: DebateSectionViewModel[]
}

/**
 * Each section has a name and an array of speeches
 * @property {string} SectionName
 * @property {DebateSpeechViewModel[]} DebateSpeeches
 *  */ 
interface DebateSectionViewModel {
  SectionName: string,
  DebateSpeeches: DebateSpeechViewModel[]
}

/**
 * Each speech has the member's name, start time and speaking time 
 * @property {string} MemberName
 * @property {string} StartTime
 * @property {string} SpeakingTime
 *  */ 
interface DebateSpeechViewModel {
  MemberName: string,
  StartTime: string,
  SpeakingTime: string
}


