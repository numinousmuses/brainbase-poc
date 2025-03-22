import React, { useState, useEffect, FC } from 'react';
import { ChatFileBased, ChatFileBasedVersion } from "@/lib/interfaces";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
// Version list component
import { Button } from "@/components/ui/button";
import { History } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"
  
interface DiffViewProps {
  originalText: string;
  diff: string | undefined;
}

interface DiffLine {
  line: string;
  type: 'addition' | 'deletion' | 'normal';
}

// Diff visualization component that highlights changes inline
const DiffView: FC<DiffViewProps> = ({ originalText, diff }) => {
  const [renderedDiff, setRenderedDiff] = useState<DiffLine[]>([]);

  useEffect(() => {
    if (!diff) {
      setRenderedDiff([{ line: originalText, type: 'normal' }]);
      return;
    }

    // Process diff to create inline visualization
    const diffLines = diff.split('\n');
    const processedDiff: DiffLine[] = [];
    
    diffLines.forEach(line => {
      if (line.startsWith('+++') || line.startsWith('---') || line.startsWith('@@')) {
        // Skip header lines
        return;
      }

      if (line.startsWith('+')) {
        processedDiff.push({ line: line.substring(1), type: 'addition' });
      } else if (line.startsWith('-')) {
        processedDiff.push({ line: line.substring(1), type: 'deletion' });
      } else if (line.startsWith('\\')) {
        // No newline indicator - skip
        return;
      } else {
        // Context line (unchanged)
        processedDiff.push({ line: line.startsWith(' ') ? line.substring(1) : line, type: 'normal' });
      }
    });
    
    setRenderedDiff(processedDiff);
  }, [originalText, diff]);

  return (
    <div className="diff-container overflow-auto max-h-[80vh] bg-neutral-950 rounded text-white">
      <div className="language-python text-xs bg-neutral-950 text-white">
        {renderedDiff.map((item, idx) => (
          <div 
            key={idx} 
            className={`diff-line ${
              item.type === 'addition' ? 'bg-green-900/30 border-l-1 border-green-500' : 
              item.type === 'deletion' ? 'bg-red-900/30 border-l-1 border-red-500' : 
              'bg-neutral-950'
            } py-1 px-2 whitespace-pre-wrap text-white`}
          >
            <span className="mr-2 text-white">
              {item.type === 'addition' ? '+' : item.type === 'deletion' ? '-' : ' '}
            </span>
            {item.line}
          </div>
        ))}
      </div>
    </div>
  );
};

interface VersionListProps {
  versions: ChatFileBasedVersion[];
  onSelect: (version: ChatFileBasedVersion) => void;
  selectedVersionId: string | undefined;
  onRevert?: (version: ChatFileBasedVersion) => void;
}



// Inside the VersionList component, add a Revert button
const VersionList: FC<VersionListProps> = ({ versions, onSelect, selectedVersionId, onRevert }) => {
  return (
    <div className="version-list overflow-auto max-h-[60vh] bg-neutral-950 text-white p-3 rounded">
      <h3 className="text-sm font-medium mb-3 text-white">Version History</h3>
      {versions.map((version, index) => {
        const isFirst = index === 0;
        const formattedDate = new Date(version.timestamp).toLocaleString();
        return (
          <div 
            key={version.version_id}
            className={`
              version-item p-2 mb-2 cursor-pointer rounded text-white
              ${selectedVersionId === version.version_id ? 'bg-blue-800/30 border border-blue-500' : 'hover:bg-neutral-800'}
            `}
          >
            <div className="flex justify-between items-center">
              <div onClick={() => onSelect(version)}>
                <div className="text-xs font-medium text-white">{isFirst ? 'Latest' : `v${versions.length - index}`}</div>
                <div className="text-xs text-neutral-300">{formattedDate}</div>
              </div>
              {!isFirst && selectedVersionId === version.version_id && (
                
                <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs bg-blue-900 hover:bg-blue-800 border-blue-700 cursor-pointer"
                    onClick={() => onRevert && onRevert(version)}
                    >
                        <History />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Revert to this version</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Update VersionDiffExplorer interface to pass the websocket reference
interface VersionDiffExplorerProps {
  basedFiles: ChatFileBased[];
  selectedBasedFileName: string;
  selectedBasedFileContent: string;
  wsRef?: React.MutableRefObject<WebSocket | null>; // Add this
}

// This is the main component to replace the current diff explorer
const VersionDiffExplorer: FC<VersionDiffExplorerProps> = ({ 
  basedFiles, 
  selectedBasedFileName, 
  selectedBasedFileContent,
  wsRef 
}) => {
  const [selectedVersion, setSelectedVersion] = useState<ChatFileBasedVersion | null>(null);
  const [currentFile, setCurrentFile] = useState<ChatFileBased | null>(null);
  
  // Update current file when basedFiles or selectedBasedFileName changes
  useEffect(() => {
    const file = basedFiles.find(file => file.name === selectedBasedFileName) || null;
    setCurrentFile(file);
    // Reset selected version when file changes
    setSelectedVersion(null);
  }, [basedFiles, selectedBasedFileName]);
  
  // Sort versions by timestamp (newest first)
  const sortedVersions = currentFile?.versions ? 
    [...currentFile.versions].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ) : 
    [];

  // Handler for selecting a version
  const handleVersionSelect = (version: ChatFileBasedVersion) => {
    setSelectedVersion(version);
  };

  const handleRevert = (version: ChatFileBasedVersion) => {
    if (!wsRef?.current || wsRef.current.readyState !== WebSocket.OPEN || !selectedBasedFileName) {
      console.error("WebSocket is not connected or filename is missing.");
      return;
    }

    const revertData = {
      action: "revert_version",
      version_id: version.version_id,
      filename: selectedBasedFileName
    };
    
    wsRef.current.send(JSON.stringify(revertData));
  };

  return (
    <div className="version-diff-explorer bg-neutral-950 text-white h-full">
      <div className="flex items-center justify-between p-2 border-b">
        <p className="text-md font-medium text-neutral-200">Version Diff Explorer</p>
        <h2 className="text-md font-medium text-neutral-200">{selectedBasedFileName}</h2>
      </div>
      {/* Instructions when no version is selected */}
      {sortedVersions.length > 0 && !selectedVersion && (
        <div className="mt-4 p-3 bg-neutral-800 rounded text-sm text-neutral-300">
          Select a version from the list to view changes compared to the latest version.
        </div>
      )}
      
      <ResizablePanelGroup direction="horizontal" className="flex flex-row gap-4 h-full">
        {/* Left side: Diff visualization */}
        <ResizablePanel className="w-2/3 text-xs h-full">
          {sortedVersions.length > 0 ? (
            <DiffView 
              originalText={selectedBasedFileContent} 
              diff={selectedVersion?.diff} 
              
            />
          ) : (
            <div className="text-center p-4 text-neutral-400 bg-neutral-900 rounded">
              No version history available for this file.
            </div>
          )}
        </ResizablePanel>
        <ResizableHandle withHandle />
        
        {/* Right side: Version list */}
        <ResizablePanel className="w-1/3">
          {sortedVersions.length > 0 ? (
            <VersionList 
              versions={sortedVersions} 
              onSelect={handleVersionSelect}
              selectedVersionId={selectedVersion?.version_id}
              onRevert={handleRevert}
            />
          ) : (
            <div className="text-center p-4 text-neutral-400 bg-neutral-900 rounded">
              No versions available
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
      
      
    </div>
  );
};

export default VersionDiffExplorer;
