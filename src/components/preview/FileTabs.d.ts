import React from 'react';
import { SeparatedFiles } from '../../utils/functions/fileSeparator';
interface FileTabsProps {
    files: SeparatedFiles;
    activeFile: string;
    setActiveFile: React.Dispatch<React.SetStateAction<string>>;
    html: string;
    onReset: () => void;
}
declare const FileTabs: React.FC<FileTabsProps>;
export default FileTabs;
