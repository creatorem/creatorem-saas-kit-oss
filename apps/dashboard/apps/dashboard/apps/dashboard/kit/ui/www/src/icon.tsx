import { FR, GB } from 'country-flag-icons/react/3x2';
import type * as LucideIcons from 'lucide-react';
import {
    AlertCircleIcon,
    ArchiveIcon,
    ArrowDownIcon,
    ArrowDownToLineIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    ArrowUpDownIcon,
    ArrowUpFromLineIcon,
    ArrowUpIcon,
    ArrowUpRightIcon,
    AudioLinesIcon,
    BadgeCheckIcon,
    BadgeInfoIcon,
    BadgeXIcon,
    BanIcon,
    BarChart3Icon,
    BellIcon,
    BellOffIcon,
    BlendIcon,
    BookIcon,
    BookOpenIcon,
    BotIcon,
    BoxIcon,
    BriefcaseBusinessIcon,
    Calendar1,
    CalendarCheckIcon,
    CalendarDaysIcon,
    CalendarIcon,
    ChartNoAxesCombinedIcon,
    CheckIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronsLeftIcon,
    ChevronsLeftRightIcon,
    ChevronsRightIcon,
    ChevronsRightLeftIcon,
    ChevronsUpDownIcon,
    ChevronUpIcon,
    CircleArrowUpIcon,
    CircleCheckIcon,
    CircleDotIcon,
    CircleIcon,
    CircleSlashIcon,
    CircleXIcon,
    CircuitBoardIcon,
    ClipboardIcon,
    ClockIcon,
    CodeIcon,
    CogIcon,
    CookieIcon,
    CopyIcon,
    CornerDownLeftIcon,
    CreditCardIcon,
    CuboidIcon,
    DatabaseIcon,
    DiamondIcon,
    DollarSignIcon,
    DownloadIcon,
    EqualApproximatelyIcon,
    ExternalLink,
    EyeIcon,
    EyeOffIcon,
    FileBarChartIcon,
    FileIcon,
    FileJsonIcon,
    FileText,
    FileTextIcon,
    FlameIcon,
    Folder,
    FolderOpen,
    FoldVerticalIcon,
    GitBranch,
    GripVertical,
    HandCoinsIcon,
    HelpCircle,
    HomeIcon,
    Image as ImageIcon,
    ImageUpIcon,
    InfoIcon,
    KeyboardIcon,
    KeyRoundIcon,
    LaptopIcon,
    LayoutIcon,
    LinkIcon,
    LoaderIcon,
    LoaderPinwheelIcon,
    LockIcon,
    LogInIcon,
    LogOutIcon,
    type LucideProps,
    MailIcon,
    MapPinIcon,
    MenuIcon,
    MessagesSquareIcon,
    Mic,
    MicOff,
    Minus,
    MonitorIcon,
    MoonIcon,
    MoreHorizontalIcon,
    MoveVerticalIcon,
    NavigationIcon,
    PaletteIcon,
    PanelLeftIcon,
    Paperclip,
    PencilIcon,
    PencilRuler,
    PhoneIcon,
    PlayIcon,
    PlusCircleIcon,
    PlusIcon,
    PopcornIcon,
    Quote,
    RadioIcon,
    RefreshCcwIcon,
    RefreshCwIcon,
    RocketIcon,
    RotateCcwIcon,
    ScaleIcon,
    SchoolIcon,
    SearchIcon,
    SendHorizonalIcon,
    ServerCrash,
    Settings2Icon,
    SettingsIcon,
    ShareIcon,
    ShellIcon,
    ShieldIcon,
    ShoppingCartIcon,
    SignpostBigIcon,
    SmartphoneIcon,
    SparklesIcon,
    Square,
    SquarePenIcon,
    SquarePlayIcon,
    Star,
    StopCircleIcon,
    StoreIcon,
    SunIcon,
    SunriseIcon,
    TableIcon,
    TabletIcon,
    TagIcon,
    Tally5Icon,
    TerminalIcon,
    TestTubeDiagonalIcon,
    TextAlignStartIcon,
    ThumbsDown,
    ThumbsUp,
    TrashIcon,
    TrendingDownIcon,
    TrendingUpIcon,
    TriangleAlertIcon,
    UploadCloudIcon,
    UploadIcon,
    UserIcon,
    Users2Icon,
    UsersIcon,
    VolumeX,
    WalletIcon,
    XIcon,
    ZapIcon,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';
import { JSX } from 'react';

/**
 * There is several benefits of using the Icon object:
 * - Allow to see which icons are available in the project.
 * - Provides typescript autocompletion to push developers to use the already loaded icons.
 * - Allows to easily change the icon library if needed.
 * - Makes the code more readable.
 * - Useful to share icon components creating native/www UI interfaces.
 *
 * The only inconvenience is that we need to update the Icon object when we add a new icon.
 */
const customIcons = {
    frFlag: FR as (props: LucideProps) => JSX.Element,
    gbFlag: GB as (props: LucideProps) => JSX.Element,
    external: (props: LucideProps): JSX.Element => {
        return (
            <svg width="6" height="6" viewBox="0 0 6 6" {...props}>
                <path
                    fill="currentColor"
                    d="M1.252 5.547l-.63-.63 3.16-3.161H1.383L1.39.891h3.887v3.89h-.87l.005-2.396-3.159 3.162z"
                />
            </svg>
        );
    },
    whatsapp: (props: LucideProps): JSX.Element => {
        return (
            <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 448 512"
                height="1em"
                width="1em"
                {...props}
            >
                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path>
            </svg>
        );
    },
    comma: (props: LucideProps): JSX.Element => {
        return (
            <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 24 24"
                height="1em"
                width="1em"
                {...props}
            >
                <path d="M14.4167 6.67891C15.4469 7.77257 16.0001 9 16.0001 10.9897C16.0001 14.4891 13.5436 17.6263 9.96951 19.1768L9.07682 17.7992C12.4121 15.9946 13.0639 13.6539 13.3245 12.178C12.7875 12.4557 12.0845 12.5533 11.3954 12.4895C9.59102 12.3222 8.16895 10.8409 8.16895 9C8.16895 7.067 9.73595 5.5 11.6689 5.5C12.742 5.5 13.7681 5.99045 14.4167 6.67891Z"></path>
            </svg>
        );
    },
    linkedIn: (props: LucideProps): JSX.Element => {
        return (
            <svg width="16" height="16" strokeLinejoin="round" color="currentcolor" viewBox="0 0 16 16" {...props}>
                <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M2 0a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V2a2 2 0 00-2-2H2zm3 6.75V13H3V6.75h2zM5 4.5c0 .556-.386 1-1.006 1h-.012C3.386 5.5 3 5.056 3 4.5c0-.568.398-1 1.006-1s.982.432.994 1zM8.5 13h-2s.032-5.568 0-6.25h2v1.034s.5-1.034 2-1.034 2.5.848 2.5 3.081V13h-2v-2.89s0-1.644-1.264-1.644S8.5 9.94 8.5 9.94V13z"
                    clipRule="evenodd"
                />
            </svg>
        );
    },
    notion: (props: LucideProps): JSX.Element => {
        return (
            <svg
                stroke="currentColor"
                fill="none"
                strokeWidth="0"
                viewBox="0 0 15 15"
                height="16"
                width="16"
                {...props}
            >
                <path
                    d="M3.25781 3.11684C3.67771 3.45796 3.83523 3.43193 4.62369 3.37933L12.0571 2.93299C12.2147 2.93299 12.0836 2.77571 12.0311 2.74957L10.7965 1.85711C10.56 1.67347 10.2448 1.46315 9.64083 1.51576L2.44308 2.04074C2.18059 2.06677 2.12815 2.19801 2.2327 2.30322L3.25781 3.11684ZM3.7041 4.84917V12.6704C3.7041 13.0907 3.91415 13.248 4.38693 13.222L12.5562 12.7493C13.0292 12.7233 13.0819 12.4341 13.0819 12.0927V4.32397C13.0819 3.98306 12.9508 3.79921 12.6612 3.82545L4.12422 4.32397C3.80918 4.35044 3.7041 4.50803 3.7041 4.84917ZM11.7688 5.26872C11.8212 5.50518 11.7688 5.74142 11.5319 5.76799L11.1383 5.84641V11.6205C10.7965 11.8042 10.4814 11.9092 10.2188 11.9092C9.79835 11.9092 9.69305 11.7779 9.37812 11.3844L6.80345 7.34249V11.2532L7.61816 11.437C7.61816 11.437 7.61816 11.9092 6.96086 11.9092L5.14879 12.0143C5.09615 11.9092 5.14879 11.647 5.33259 11.5944L5.80546 11.4634V6.29276L5.1489 6.24015C5.09625 6.00369 5.22739 5.66278 5.5954 5.63631L7.53935 5.50528L10.2188 9.5998V5.97765L9.53564 5.89924C9.4832 5.61018 9.69305 5.40028 9.95576 5.37425L11.7688 5.26872ZM1.83874 1.33212L9.32557 0.780787C10.245 0.701932 10.4815 0.754753 11.0594 1.17452L13.4492 2.85424C13.8436 3.14309 13.975 3.22173 13.975 3.53661V12.7493C13.975 13.3266 13.7647 13.6681 13.0293 13.7203L4.33492 14.2454C3.78291 14.2717 3.52019 14.193 3.23111 13.8253L1.47116 11.5419C1.1558 11.1216 1.02466 10.8071 1.02466 10.4392V2.25041C1.02466 1.77825 1.23504 1.38441 1.83874 1.33212Z"
                    fill="currentColor"
                ></path>
            </svg>
        );
    },
    xSocialNetwork: (props: LucideProps): JSX.Element => {
        return (
            <svg width="16" height="16" strokeLinejoin="round" color="currentcolor" viewBox="0 0 16 16" {...props}>
                <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M.5.5h5.25l3.734 5.21L14 .5h2l-5.61 6.474L16.5 15.5h-5.25l-3.734-5.21L3 15.5H1l5.61-6.474L.5.5zM12.02 14L3.42 2h1.56l8.6 12h-1.56z"
                    clipRule="evenodd"
                />
            </svg>
        );
    },
    youtube: (props: LucideProps): JSX.Element => {
        return (
            <svg width="16" height="16" strokeLinejoin="round" color="currentcolor" viewBox="0 0 16 16" {...props}>
                <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M14.251 3.435a2.003 2.003 0 011.414 1.414C16 6.097 16 8.7 16 8.7s0 2.605-.335 3.851a2.003 2.003 0 01-1.415 1.415C13.006 14.3 8 14.3 8 14.3s-5.003 0-6.251-.334a2.004 2.004 0 01-1.414-1.415C0 11.305 0 8.7 0 8.7s0-2.603.335-3.851a2.003 2.003 0 011.414-1.414C2.997 3.1 8 3.1 8 3.1s5.003 0 6.251.335zM10.555 8.7L6.4 11.1V6.3l4.155 2.4z"
                    clipRule="evenodd"
                />
            </svg>
        );
    },
    instagram: (props: LucideProps): JSX.Element => {
        return (
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" {...props}>
                <path
                    fill="currentColor"
                    d="M10.088 7.688a2.4 2.4 0 11-4.8 0 2.4 2.4 0 014.8 0zm5.1-3.3v6.6a4.205 4.205 0 01-4.2 4.2h-6.6a4.205 4.205 0 01-4.2-4.2v-6.6a4.205 4.205 0 014.2-4.2h6.6a4.205 4.205 0 014.2 4.2zm-3.9 3.3a3.6 3.6 0 10-7.2 0 3.6 3.6 0 007.2 0zm1.2-3.9a.9.9 0 10-1.8 0 .9.9 0 001.8 0z"
                />
            </svg>
        );
    },
    tikTok: (props: LucideProps): JSX.Element => {
        return (
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" {...props}>
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
            </svg>
        );
    },
    facebook: (props: LucideProps): JSX.Element => {
        return (
            <svg width="16" height="16" strokeLinejoin="round" color="currentcolor" viewBox="0 0 16 16" {...props}>
                <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M9.003 15.938A8.001 8.001 0 008 0a8 8 0 00-1.75 15.808V10.43H4.5V8h1.75V6.94c0-2.718 1.035-3.976 3.701-3.976.505 0 1.377.099 1.734.198v2.21c-.188-.02-.517-.03-.923-.03C9.454 5.343 9 5.839 9 7.129V8h2.558l-.447 2.43H9.003v5.508z"
                    clipRule="evenodd"
                />
            </svg>
        );
    },
    github: (props: LucideProps): JSX.Element => {
        return (
            <svg width="15" height="15" fill="none" viewBox="0 0 15 15" {...props}>
                <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M7.5.25a7.25 7.25 0 0 0-2.292 14.13c.363.066.495-.158.495-.35 0-.172-.006-.628-.01-1.233-2.016.438-2.442-.972-2.442-.972-.33-.838-.805-1.06-.805-1.06-.658-.45.05-.441.05-.441.728.051 1.11.747 1.11.747.647 1.108 1.697.788 2.11.602.066-.468.254-.788.46-.969-1.61-.183-3.302-.805-3.302-3.583 0-.792.283-1.438.747-1.945-.075-.184-.324-.92.07-1.92 0 0 .61-.194 1.994.744A7 7 0 0 1 7.5 3.756 7 7 0 0 1 9.315 4c1.384-.938 1.992-.743 1.992-.743.396.998.147 1.735.072 1.919.465.507.745 1.153.745 1.945 0 2.785-1.695 3.398-3.31 3.577.26.224.492.667.492 1.343 0 .97-.009 1.751-.009 1.989 0 .194.131.42.499.349A7.25 7.25 0 0 0 7.499.25"
                    clipRule="evenodd"
                />
            </svg>
        );
    },
    google: (props: LucideProps): JSX.Element => {
        return (
            <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                version="1.1"
                viewBox="0 0 48 48"
                enableBackground="new 0 0 48 48"
                height="16"
                width="16"
                {...props}
            >
                <path
                    fill="#FFC107"
                    d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12
            c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24
            c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                ></path>
                <path
                    fill="#FF3D00"
                    d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657
            C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                ></path>
                <path
                    fill="#4CAF50"
                    d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36
            c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                ></path>
                <path
                    fill="#1976D2"
                    d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571
            c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                ></path>
            </svg>
        );
    },
    microsoft: (props: LucideProps): JSX.Element => {
        return (
            <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 448 512"
                height="16"
                width="16"
                {...props}
            >
                <path d="M0 32h214.6v214.6H0V32zm233.4 0H448v214.6H233.4V32zM0 265.4h214.6V480H0V265.4zm233.4 0H448V480H233.4V265.4z"></path>
            </svg>
        );
    },
    appleCompany: (props: LucideProps): JSX.Element => {
        return (
            <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 384 512"
                height="16"
                width="16"
                {...props}
            >
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"></path>
            </svg>
        );
    },
    android: (props: LucideProps): JSX.Element => {
        return (
            <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 24 24"
                height="16"
                width="16"
                {...props}
            >
                <path
                    fillRule="evenodd"
                    d="M5.68524564,7.91390616 L18.4032637,7.91390616 L18.4032637,18.2777185 C18.4032637,18.8934049 17.9041016,19.392567 17.2891666,19.392567 L16.0152889,19.392567 L16.0152889,22.54887 C16.0152889,23.3504036 15.3759782,24 14.5867968,24 C13.7955958,24 13.1572245,23.3504036 13.1572245,22.54887 L13.1572245,19.392567 L10.9323651,19.392567 L10.9323651,22.54887 C10.9323651,23.3504036 10.2917863,24 9.50265183,24 C8.71365828,24 8.07312646,23.3504036 8.07312646,22.54887 L8.07312646,19.392567 L6.80037593,19.392567 C6.18530006,19.392567 5.68519867,18.8934049 5.68519867,18.2777185 L5.68519867,7.91390616 L5.68524564,7.91390616 Z M3.19295784,7.82931914 C2.39574512,7.82931914 1.75,8.48511514 1.75,9.2946801 L1.75,15.0216583 C1.75,15.8302839 2.39574512,16.4872071 3.19295784,16.4872071 C3.99031146,16.4872071 4.63591568,15.8302839 4.63591568,15.0216583 L4.63591568,9.2946801 C4.63591568,8.48511514 3.99031146,7.82931914 3.19295784,7.82931914 L3.19295784,7.82931914 Z M18.4033106,6.86955468 L5.68524564,6.86955468 C5.84220834,5.05767343 7.01754994,3.49847301 8.70952521,2.59567916 L7.50032062,0.820150132 C7.33725225,0.580713909 7.39877862,0.254013563 7.63868451,0.0909921564 C7.8783086,-0.07202925 8.20435141,-0.0100332096 8.36821822,0.229215147 L9.68615071,2.16574601 C10.4168586,1.91306518 11.2100322,1.76798505 12.0442547,1.76798505 C12.8794634,1.76798505 13.672684,1.91306518 14.4033449,2.16607478 L15.7212774,0.229919647 C15.8831246,-0.00998624287 16.2102007,-0.0719822833 16.4498248,0.0910391231 C16.6897307,0.25406053 16.7512571,0.580760876 16.5881887,0.820197099 L15.3799704,2.59572613 C17.0718987,3.49795638 18.2464419,5.0571568 18.4033106,6.86955468 L18.4033106,6.86955468 Z M10.0653129,4.40760737 C10.0653129,4.01905189 9.75068296,3.70390535 9.36226837,3.70390535 C8.97286748,3.70390535 8.65823758,4.01905189 8.65823758,4.40760737 C8.65823758,4.79597499 8.97390075,5.11098063 9.36226837,5.11098063 C9.75063599,5.11098063 10.0653129,4.79597499 10.0653129,4.40760737 L10.0653129,4.40760737 Z M15.5194145,4.40760737 C15.5194145,4.01905189 15.2037044,3.70390535 14.8153837,3.70390535 C14.4259828,3.70390535 14.1122923,4.01905189 14.1122923,4.40760737 C14.1122923,4.79597499 14.4259828,5.11098063 14.8153837,5.11098063 C15.2037514,5.11098063 15.5194145,4.79597499 15.5194145,4.40760737 L15.5194145,4.40760737 Z M20.8965378,7.82729957 C20.1001704,7.82729957 19.4525936,8.48408187 19.4525936,9.2936938 L19.4525936,15.0226915 C19.4525936,15.8323035 20.1001704,16.4892736 20.8965378,16.4892736 C21.6939384,16.4892736 22.3384623,15.8323504 22.3384623,15.0226915 L22.3384623,9.2936938 C22.3385093,8.48408187 21.6939384,7.82729957 20.8965378,7.82729957 L20.8965378,7.82729957 Z"
                ></path>
            </svg>
        );
    },
} as const;

type AllLucideIconName = Exclude<keyof typeof LucideIcons, 'createLucideIcon' | 'LucideProps' | 'default'>;

const lucideIcons = {
    Archive: ArchiveIcon,
    ArrowDownToLine: ArrowDownToLineIcon,
    ArrowUpFromLine: ArrowUpFromLineIcon,
    Ban: BanIcon,
    Bot: BotIcon,
    Calendar1: Calendar1,
    CalendarDays: CalendarDaysIcon,
    ChartNoAxesCombined: ChartNoAxesCombinedIcon,
    CircleSlash: CircleSlashIcon,
    Clipboard: ClipboardIcon,
    Database: DatabaseIcon,
    ExternalLink: ExternalLink,
    File: FileIcon,
    SquarePlay: SquarePlayIcon,
    FileJson: FileJsonIcon,
    FileText: FileText,
    FileTextIcon: FileTextIcon,
    EqualApproximately: EqualApproximatelyIcon,
    Folder: Folder,
    FolderOpen: FolderOpen,
    GitBranch: GitBranch,
    GripVertical: GripVertical,
    HelpCircle: HelpCircle,
    Mic: Mic,
    MicOff: MicOff,
    Navigation: NavigationIcon,
    Palette: PaletteIcon,
    Paperclip: Paperclip,
    PencilRuler: PencilRuler,
    Popcorn: PopcornIcon,
    Quote: Quote,
    ServerCrash: ServerCrash,
    Shell: ShellIcon,
    Star: Star,
    Sunrise: SunriseIcon,
    Terminal: TerminalIcon,
    ThumbsDown: ThumbsDown,
    ThumbsUp: ThumbsUp,
    VolumeX: VolumeX,
    ZoomIn: ZoomIn,
    ZoomOut: ZoomOut,
    ShoppingCart: ShoppingCartIcon,
    ImageUp: ImageUpIcon,
    CircleX: CircleXIcon,
    TextAlignStart: TextAlignStartIcon,
    ArrowUpRight: ArrowUpRightIcon,
    Wallet: WalletIcon,
    ChevronsLeftRight: ChevronsLeftRightIcon,
    ChevronsRightLeft: ChevronsRightLeftIcon,
    MoveVertical: MoveVerticalIcon,
    PanelLeft: PanelLeftIcon,
    HandCoins: HandCoinsIcon,
    TrendingUp: TrendingUpIcon,
    TrendingDown: TrendingDownIcon,
    CircleArrowUp: CircleArrowUpIcon,
    // Theme icons
    Moon: MoonIcon,
    Sun: SunIcon,
    Laptop: LaptopIcon,
    // Loading icons
    Loader: LoaderIcon,
    LoaderPinwheel: LoaderPinwheelIcon,
    // Business icons
    BriefcaseBusiness: BriefcaseBusinessIcon,
    Users2: Users2Icon,
    Zap: ZapIcon,
    // Chart and data icons
    BarChart3: BarChart3Icon,
    Blend: BlendIcon,
    CircleDot: CircleDotIcon,
    Diamond: DiamondIcon,
    ArrowUpDown: ArrowUpDownIcon,
    // Navigation icons
    Home: HomeIcon,
    Settings: SettingsIcon,
    Settings2: Settings2Icon,
    MessagesSquare: MessagesSquareIcon,
    // Legal icons
    Scale: ScaleIcon,
    Cookie: CookieIcon,
    // Chevron variations
    ChevronUp: ChevronUpIcon,
    ChevronsLeft: ChevronsLeftIcon,
    ChevronsRight: ChevronsRightIcon,
    ChevronsUpDown: ChevronsUpDownIcon,
    // UI icons
    Info: InfoIcon,
    Minus: Minus,
    Eye: EyeIcon,
    EyeOff: EyeOffIcon,
    PlusCircle: PlusCircleIcon,
    Image: ImageIcon,
    SignpostBig: SignpostBigIcon,
    CornerDownLeft: CornerDownLeftIcon,
    ArrowUp: ArrowUpIcon,
    BellOff: BellOffIcon,
    ArrowDown: ArrowDownIcon,
    ArrowLeft: ArrowLeftIcon,
    ArrowRight: ArrowRightIcon,
    Phone: PhoneIcon,
    Upload: UploadIcon,
    Tag: TagIcon,
    Share: ShareIcon,
    Clock: ClockIcon,
    Download: DownloadIcon,
    SquarePen: SquarePenIcon,
    CircleCheck: CircleCheckIcon,
    Keyboard: KeyboardIcon,
    TriangleAlert: TriangleAlertIcon,
    MapPin: MapPinIcon,
    LogOut: LogOutIcon,
    LogIn: LogInIcon,
    Link: LinkIcon,
    DollarSign: DollarSignIcon,
    Tablet: TabletIcon,
    Smartphone: SmartphoneIcon,
    Shield: ShieldIcon,
    RefreshCcw: RefreshCcwIcon,
    Monitor: MonitorIcon,
    Menu: MenuIcon,
    TestTubeDiagonal: TestTubeDiagonalIcon,
    Copy: CopyIcon,
    Store: StoreIcon,
    CreditCard: CreditCardIcon,
    Users: UsersIcon,
    Trash: TrashIcon,
    BadgeInfo: BadgeInfoIcon,
    BadgeX: BadgeXIcon,
    BadgeCheck: BadgeCheckIcon,
    UploadCloud: UploadCloudIcon,
    User: UserIcon,
    Bell: BellIcon,
    Check: CheckIcon,
    Calendar: CalendarIcon,
    Tally5: Tally5Icon,
    Code: CodeIcon,
    ChevronDown: ChevronDownIcon,
    X: XIcon,
    Circle: CircleIcon,
    AlertCircle: AlertCircleIcon,
    Lock: LockIcon,
    Mail: MailIcon,
    Flame: FlameIcon,
    Rocket: RocketIcon,
    Sparkles: SparklesIcon,
    CalendarCheck: CalendarCheckIcon,
    ChevronRight: ChevronRightIcon,
    ChevronLeft: ChevronLeftIcon,
    MoreHorizontal: MoreHorizontalIcon,
    School: SchoolIcon,
    Book: BookIcon,
    BookOpen: BookOpenIcon,
    Box: BoxIcon,
    CircuitBoard: CircuitBoardIcon,
    Cuboid: CuboidIcon,
    FileBarChart: FileBarChartIcon,
    Layout: LayoutIcon,
    Table: TableIcon,
    Play: PlayIcon,
    Plus: PlusIcon,
    SendHorizontal: SendHorizonalIcon,
    Search: SearchIcon,
    RotateCcw: RotateCcwIcon,
    AudioLines: AudioLinesIcon,
    Cog: CogIcon,
    FoldVertical: FoldVerticalIcon,
    Pencil: PencilIcon,
    RefreshCw: RefreshCwIcon,
    Square: Square,
    StopCircle: StopCircleIcon,
    KeyRound: KeyRoundIcon,
    Radio: RadioIcon,
} satisfies {
    [key in AllLucideIconName]?: LucideIcons.LucideIcon;
};

type LucideIconName = keyof typeof lucideIcons;
type CustomIconName = keyof typeof customIcons;
export type IconName = LucideIconName | CustomIconName;

export const Icon: React.FC<{ name: IconName; fallback?: IconName } & LucideProps> = ({ name, fallback, ...props }) => {
    const getIconComponent = () => {
        if (name in customIcons) {
            return customIcons[name as CustomIconName];
        }
        if (!(name in lucideIcons)) {
            if (fallback && fallback in lucideIcons) {
                return lucideIcons[fallback as LucideIconName];
            } else if (fallback && name in customIcons) {
                return customIcons[name as CustomIconName];
            }
            // for debugging
            throw new Error(`Icon ${name} is not installed.`);
        }
        return lucideIcons[name as LucideIconName];
    };

    const IconComponent = getIconComponent();

    return <IconComponent {...props} />;
};
