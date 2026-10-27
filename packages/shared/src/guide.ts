/** Content of the in-app Guide. English source strings; they are translated through the dictionary. */
export interface GuideImage {
  /** File name without extension, in apps/web/public/guide/<language>/. */
  file: string;
  caption: string;
}

export interface GuideSection {
  id: string;
  icon: string;
  title: string;
  intro: string;
  points: string[];
  tip?: string;
  images: GuideImage[];
}

export const GUIDE_TEXT = { title: "Guide", subtitle: "How to use emidb, page by page.", onThisPage: "On this page", enlarge: "Click a picture to enlarge it.", tip: "Tip" } as const;

export const GUIDE_SECTIONS: readonly GuideSection[] = [
  {
    id: "start",
    icon: "rocket_launch",
    title: "Getting started",
    intro: "emidb is a database of pickups, pickup sets and wiring diagrams. Everything is stored on the server, so every phone, tablet and computer that opens the same address sees the same data.",
    points: [
      "If a password screen appears, enter the shared password. The sign-in stays active for 90 days on that device.",
      "Use the sidebar on the left to move between pages. The small arrow at the top collapses it to icons, which gives tables more room on a tablet.",
      "On a tablet or phone, add the page to the home screen (Safari: Share, then Add to Home Screen; Chrome: menu, then Add to Home screen) so it opens like an app.",
      "Always use the same address on every device. Addresses such as localhost belong to one computer only and show a different, separate database.",
    ],
    tip: "After an update, open Settings and press Reload app to get the newest version.",
    images: [
      { file: "login", caption: "The sign-in screen, shown only when a password has been set." },
    ],
  },
  {
    id: "pickups",
    icon: "graphic_eq",
    title: "Pickups",
    intro: "The main table: one row per pickup, with the measurements and construction details needed for repairs and rewinds.",
    points: [
      "Type in the search box to find a pickup by any text in its row.",
      "Click a column title to sort by it. Click again to reverse the order.",
      "Tap the funnel next to a column title to filter that column: type text, pick values from a list, or enter a number with a ± tolerance.",
      "Tap a row to open the pickup. The pencil edits it, and the double square makes an editable copy, handy for a variant of an existing pickup.",
      "Tick the boxes on the left to select pickups. Then delete them with the bin in the toolbar, or press Compare when two or more are selected.",
      "The paperclip column shows attached files. Tap it to open them right away.",
      "New pickup adds one. Only the name is required, so you can add the rest as you measure.",
    ],
    images: [
      { file: "pickups-list", caption: "The pickups table with search, sortable columns and the toolbar." },
    ],
  },
  {
    id: "columns",
    icon: "view_column",
    title: "Choose your columns",
    intro: "A pickup has about 40 properties and you rarely need all of them at once. The Columns menu decides what the table shows.",
    points: [
      "Tick or untick columns, grouped by topic. The table changes immediately.",
      "The first icon shows every column, the disk saves the current choice as the default for this table, and the circular arrow returns to that default.",
      "Under Side columns you can also hide the files column and the edit and duplicate buttons to gain space.",
      "The same lists are in Settings under Default columns, where you can set the starting point for each table.",
    ],
    tip: "On a small tablet keep five or six columns and open the details page for the rest.",
    images: [
      { file: "columns-menu", caption: "The Columns menu: icons at the top, columns by topic, side columns at the bottom." },
    ],
  },
  {
    id: "filter",
    icon: "filter_alt",
    title: "Filtering",
    intro: "There are two ways to narrow the list down.",
    points: [
      "Column filters: tap the funnel next to a column title, as shown first below.",
      "The Filter page: press Filter above the table. A form on the left lists every property by topic, and the matching pickups appear on the right while you type.",
      "Numbers match around a value: enter 8 with ± 1 to get everything from 7 to 9.",
      "Lists let you pick several values at once. A pickup matches if it has any of them.",
      "The filter stays active when you go back to the table, so you can keep working on the result. Clear all removes it.",
      "Compare results sends all matches, or just the ticked ones, straight to the comparison.",
    ],
    images: [
      { file: "column-filter", caption: "A filter on one column, opened from the funnel in its title." },
      { file: "pickup-filter", caption: "The Filter page: the form on the left, matching pickups on the right." },
    ],
  },
  {
    id: "match",
    icon: "straighten",
    title: "Find closest match",
    intro: "Found an unknown pickup? Measure it and let emidb suggest what it could be.",
    points: [
      "Open Pickups, then Find match, and enter what you measured: DC resistance in kΩ and, if you have them, inductance, gauss or output.",
      "Pickups are ranked by how close they are to your numbers. 100% is an exact match.",
      "Each row shows the pickup's own value and how far it is from yours, for example +2.5%.",
      "A pickup that lacks some of the values is still listed, with a note such as 1 of 2 compared.",
      "Compare top matches puts the best four side by side.",
    ],
    tip: "Resistance alone gives a short list. Adding inductance usually singles out one pickup.",
    images: [
      { file: "pickup-match", caption: "Measured 8.2 kΩ and 4.2 H: the closest pickups first." },
    ],
  },
  {
    id: "details",
    icon: "description",
    title: "Pickup details and editing",
    intro: "Open a pickup to see everything about it, or to change it.",
    points: [
      "The details page groups every property by topic. Files are on the right, together with the sets the pickup belongs to.",
      "Edit opens the form, Duplicate starts a copy to adjust, and the bin moves the pickup to the Trash.",
      "In the form, lists have a search box. Add new… at the end of a list creates a manufacturer or type without leaving the form.",
      "Files can be added while you are still creating the pickup. They are uploaded when you save.",
    ],
    images: [
      { file: "pickup-detail", caption: "The details page with two attached pictures." },
      { file: "pickup-form", caption: "The edit form." },
    ],
  },
  {
    id: "compare",
    icon: "compare_arrows",
    title: "Compare pickups",
    intro: "Put two or more pickups side by side.",
    points: [
      "Open it from the table (tick pickups, then Compare), from the Filter page, from a set, or from a details page.",
      "For every number the highest value is marked green and the lowest red, so differences stand out.",
      "Use Add pickup to search for another pickup and add it to the comparison.",
    ],
    images: [
      { file: "pickup-compare", caption: "Three pickups compared, with highs and lows highlighted." },
    ],
  },
  {
    id: "sets",
    icon: "view_agenda",
    title: "Pickup sets",
    intro: "A set groups the neck, middle and bridge pickups that belong together.",
    points: [
      "Create a set and choose its pickups from your pickups list.",
      "The details page shows the pickups side by side. Compare pickups opens them in the comparison.",
      "Files, such as a manufacturer's data sheet, can be attached to a set.",
    ],
    images: [
      { file: "sets-list", caption: "The list of sets." },
      { file: "set-detail", caption: "A set with its pickups side by side." },
    ],
  },
  {
    id: "wiring",
    icon: "schema",
    title: "Wiring diagrams",
    intro: "Describe how a guitar or bass is wired: which pickups, pots and switches, and keep the drawing next to it.",
    points: [
      "Choose the wiring type first. The pickup type lists then offer only what fits a guitar or a bass.",
      "Pick a Layout, such as Volume + tone, to fill in the number of pots and their roles at once. Or set No. of pots (1 to 6) yourself and describe each pot: role, type and function, for example push-pull.",
      "Add one or more switches from the list. Add switch creates another row.",
      "Attach the drawing or a PDF. On the details page it sits next to the data. Drag the divider between them to give the drawing more room, and double-click the divider to reset it.",
      "In the Filter page choose No. of pots, and a block of three fields appears for each pot. That finds, for example, every diagram where pot 2 is push-pull.",
    ],
    images: [
      { file: "wiring-list", caption: "The wiring diagrams table." },
      { file: "wiring-filter", caption: "Filtering by pot count and the function of pot 2." },
      { file: "wiring-detail", caption: "Details on the left, the drawing on the right." },
      { file: "wiring-form", caption: "The form: pickups, layout and a row of three fields for each pot." },
    ],
  },
  {
    id: "reference",
    icon: "factory",
    title: "Manufacturers, pots and switches",
    intro: "These are the lists behind the drop-downs in the forms.",
    points: [
      "Manufacturers: name, country, website and notes. Tap a row to edit it and attach colour codes or catalogue sheets.",
      "Pots & switches has four tabs: potentiometer types, switches (with their manufacturer), pickup types used in wiring diagrams, and pot layouts, for example a Les Paul with two volumes and two tones.",
      "A pot layout can have a sketch showing the positions.",
      "Names must be unique. If a name already exists you are told so.",
      "A missing entry can also be created straight from a form with Add new… in its drop-down.",
    ],
    images: [
      { file: "manufacturers", caption: "Manufacturers, with a paperclip where files are attached." },
      { file: "manufacturer-dialog", caption: "Editing a manufacturer: details and files in one window." },
      { file: "components-pots", caption: "Potentiometer types." },
      { file: "components-switches", caption: "Switches, each with its manufacturer." },
      { file: "components-layouts", caption: "Pot layouts with their positions and a sketch." },
    ],
  },
  {
    id: "library",
    icon: "folder",
    title: "Library",
    intro: "Every reference file from manufacturers, switch types and pot layouts in one place.",
    points: [
      "Attach files to a manufacturer, switch type or pot layout: open it, then drop files or press Upload. They appear in the Library with the name of the item they belong to.",
      "Search by name or file, and narrow to images or PDFs. Tap a tile to open it large.",
    ],
    tip: "Good things to keep here: colour code charts, wiring sheets from manufacturers, switch diagrams.",
    images: [
      { file: "library", caption: "The Library with pictures from manufacturers and layouts." },
    ],
  },
  {
    id: "files",
    icon: "photo_camera",
    title: "Files and photos",
    intro: "Pickups, sets, wiring diagrams, manufacturers, switches and pot layouts can all carry files: photos, PDFs, documents and CAD drawings.",
    points: [
      "Drop files onto the Files panel, or press Upload. Each file can be up to 25 MB.",
      "On a phone or tablet, Take photo opens the camera. Large photos are reduced to 2400 pixels on the long side before uploading, which saves space and time.",
      "Tap a thumbnail to view it. Tap the text underneath to write a caption, for example back side, before rewind.",
      "Images and PDFs open in a viewer. Other files are downloaded.",
      "Settings shows under Storage how much space the files take.",
    ],
    images: [
      { file: "pickup-detail", caption: "The Files panel on a pickup, with captions and sizes." },
    ],
  },
  {
    id: "trash",
    icon: "delete",
    title: "Trash and undo",
    intro: "Deleting never destroys anything right away.",
    points: [
      "After a delete a message with Undo stays for a few seconds. One tap brings the entry back.",
      "Deleted items stay in the Trash for 30 days. Open it from the sidebar to restore an item or delete it permanently. Empty trash removes everything in it.",
      "Files stay with their item, so a restore brings the files back too.",
    ],
    images: [
      { file: "trash", caption: "The Trash lists what was deleted and when it will disappear." },
    ],
  },
  {
    id: "settings",
    icon: "settings",
    title: "Settings, backup and updates",
    intro: "Everything about how the app looks and how to keep your data safe.",
    points: [
      "Appearance: language (English or Croatian), light, dark or Follow device mode, and the accent colour. These are remembered per device.",
      "Default columns: choose which columns each table shows by default.",
      "Storage: the space used by files and the database, and what is free on the disk. A red warning means the data is not saved permanently and must be fixed.",
      "Backup: Download backup saves everything, database and files, as one zip. Restore from backup replaces all data with such a zip.",
      "About: the version, Check for updates and Reload app. If the app is on the home screen, this is how you get a new version.",
      "Sign out ends the session on this device. It appears only when a password is set.",
    ],
    tip: "Download a backup after every longer work session and keep it somewhere other than the server.",
    images: [
      { file: "settings-top", caption: "Appearance and default columns." },
      { file: "settings-bottom", caption: "Storage, backup and the version." },
    ],
  },
  {
    id: "tips",
    icon: "lightbulb",
    title: "Getting the most out of emidb",
    intro: "Habits that make the database more useful over time.",
    points: [
      "Fill in the measurements when you add a pickup, resistance and inductance above all. Closest match and the filters depend on them.",
      "Keep names consistent, for example manufacturer and model. The search looks at all the text in a row.",
      "Attach a photo and the wire colour codes to every pickup you rewind. Your future self will be grateful.",
      "Use Duplicate for variants instead of typing everything again.",
      "Group pickups into sets so a whole guitar's combination can be compared at once.",
      "Use one address on every device. The data lives on the server, so there is nothing to sync.",
      "Download a backup regularly.",
      "If something looks out of date, go to Settings and press Reload app.",
    ],
    images: [
    ],
  },
];
