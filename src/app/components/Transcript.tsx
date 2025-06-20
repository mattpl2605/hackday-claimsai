"use-client";

import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { TranscriptItem } from "@/app/types";
import Image from "next/image";
import { useTranscript } from "@/app/contexts/TranscriptContext";
import { DownloadIcon, ClipboardCopyIcon } from "@radix-ui/react-icons";
import { GuardrailChip } from "./GuardrailChip";

export interface TranscriptProps {
  downloadRecording: () => void;
  canSend: boolean;
  hasSelectedAgent: boolean;
}

function Transcript({
  downloadRecording,
  canSend,
  hasSelectedAgent,
}: TranscriptProps) {
  const { transcriptItems, toggleTranscriptItemExpand } = useTranscript();
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const [prevLogs, setPrevLogs] = useState<TranscriptItem[]>([]);

  function scrollToBottom() {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }

  useEffect(() => {
    const hasNewMessage = transcriptItems.length > prevLogs.length;
    const hasUpdatedMessage = transcriptItems.some((newItem, index) => {
      const oldItem = prevLogs[index];
      return (
        oldItem &&
        (newItem.title !== oldItem.title || newItem.data !== oldItem.data)
      );
    });

    if (hasNewMessage || hasUpdatedMessage) {
      scrollToBottom();
    }

    setPrevLogs(transcriptItems);
  }, [transcriptItems]);

  const handleCopyTranscript = async () => {
    if (!transcriptRef.current) return;
    try {
      await navigator.clipboard.writeText(transcriptRef.current.innerText);
    } catch (error) {
      console.error("Failed to copy transcript:", error);
    }
  };

  const handleDownloadTranscript = () => {
    if (!transcriptRef.current) return;
    
    const transcriptText = transcriptRef.current.innerText;
    const blob = new Blob([transcriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-transcript-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-white min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 sticky top-0 z-10 text-base border-b bg-white">
        <div className="flex items-center gap-3">
          <Image
            src="/png-transparent-state-farm-logo-horizontal.png"
            alt="State Farm Logo"
            width={200}
            height={60}
            className="h-12 w-auto"
          />
          <span className="font-bold text-lg">| ClaimAI</span>
        </div>
        {hasSelectedAgent && !canSend && transcriptItems.length > 0 && (
          <div className="flex gap-x-2">
            <button
              onClick={handleDownloadTranscript}
              className="w-40 text-sm px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 flex items-center justify-center gap-x-1"
            >
              <DownloadIcon />
              <span>Download Transcript</span>
            </button>
            <button
              onClick={downloadRecording}
              className="w-40 text-sm px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 flex items-center justify-center gap-x-1"
            >
              <DownloadIcon />
              <span>Download Audio</span>
            </button>
          </div>
        )}
      </div>

      {/* Transcript Content */}
      <div
        ref={transcriptRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-y-4"
      >
        {[...transcriptItems]
          .sort((a, b) => a.createdAtMs - b.createdAtMs)
          .map((item) => {
            const {
              itemId,
              type,
              role,
              data,
              expanded,
              timestamp,
              title = "",
              isHidden,
              guardrailResult,
            } = item;

          if (isHidden) {
            return null;
          }

          if (type === "MESSAGE") {
            const isUser = role === "user";
            const containerClasses = `flex justify-end flex-col ${
              isUser ? "items-end" : "items-start"
            }`;
            const bubbleBase = `max-w-lg p-3 ${
              isUser ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-black"
            }`;
            const isBracketedMessage =
              title.startsWith("[") && title.endsWith("]");
            const messageStyle = isBracketedMessage
              ? 'italic text-gray-400'
              : '';
            const displayTitle = isBracketedMessage
              ? title.slice(1, -1)
              : title;

            return (
              <div key={itemId} className={containerClasses}>
                <div className="max-w-lg">
                  <div
                    className={`${bubbleBase} rounded-t-xl ${
                      guardrailResult ? "" : "rounded-b-xl"
                    }`}
                  >
                    <div
                      className={`text-xs ${
                        isUser ? "text-gray-400" : "text-gray-500"
                      } font-mono`}
                    >
                      {timestamp}
                    </div>
                    <div className={`whitespace-pre-wrap ${messageStyle}`}>
                      <ReactMarkdown>{displayTitle}</ReactMarkdown>
                    </div>
                  </div>
                  {guardrailResult && (
                    <div className="bg-gray-200 px-3 py-2 rounded-b-xl">
                      <GuardrailChip guardrailResult={guardrailResult} />
                    </div>
                  )}
                </div>
              </div>
            );
          } else if (type === "BREADCRUMB") {
            return (
              <div
                key={itemId}
                className="flex flex-col justify-start items-start text-gray-500 text-sm"
              >
                <span className="text-xs font-mono">{timestamp}</span>
                <div
                  className={`whitespace-pre-wrap flex items-center font-mono text-sm text-gray-800 ${
                    data ? "cursor-pointer" : ""
                  }`}
                  onClick={() => data && toggleTranscriptItemExpand(itemId)}
                >
                  {data && (
                    <span
                      className={`text-gray-400 mr-1 transform transition-transform duration-200 select-none font-mono ${
                        expanded ? "rotate-90" : "rotate-0"
                      }`}
                    >
                      ▶
                    </span>
                  )}
                  {title}
                </div>
                {expanded && data && (
                  <div className="text-gray-800 text-left">
                    <pre className="border-l-2 ml-1 border-gray-200 whitespace-pre-wrap break-words font-mono text-xs mb-2 mt-2 pl-2">
                      {JSON.stringify(data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          } else {
            // Fallback if type is neither MESSAGE nor BREADCRUMB
            return (
              <div
                key={itemId}
                className="flex justify-center text-gray-500 text-sm italic font-mono"
              >
                Unknown item type: {type}{" "}
                <span className="ml-2 text-xs">{timestamp}</span>
              </div>
            );
          }
        })}
        
        {/* Show conversation ended message when disconnected */}
        {!canSend && transcriptItems.length > 0 && (
          <div className="flex justify-center text-gray-500 text-sm italic font-mono mt-4">
            Conversation ended
          </div>
        )}
      </div>
    </div>
  );
}

export default Transcript;
