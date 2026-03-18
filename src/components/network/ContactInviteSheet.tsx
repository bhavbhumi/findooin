/**
 * ContactInviteSheet — Multi-channel invite flow for imported contacts.
 * Channels: WhatsApp deep link, Native share sheet, Copy link, SMS (Twilio placeholder).
 */
import { useState } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  MessageCircle, Share2, Link2, Smartphone, Send, CheckCircle2,
  Search, Users, ExternalLink,
} from "lucide-react";
import { useContacts, type UserContact } from "@/hooks/useContacts";

interface ContactInviteSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const INVITE_BASE_URL = "https://findooin.lovable.app";

function getInviteMessage(senderName?: string): string {
  const name = senderName || "A professional";
  return `${name} has invited you to join FindOO — India's trusted professional network for the financial services industry. Join now: ${INVITE_BASE_URL}`;
}

function getWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^\d+]/g, "");
  return `https://wa.me/${cleanPhone.replace("+", "")}?text=${encodeURIComponent(message)}`;
}

export function ContactInviteSheet({ open, onOpenChange }: ContactInviteSheetProps) {
  const { contacts, markInvited } = useContacts();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const uninvitedContacts = contacts.filter((c) => c.invite_status !== "invited");
  const filteredContacts = uninvitedContacts.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.contact_name?.toLowerCase().includes(q) ||
      c.phone_number.includes(q)
    );
  });

  const inviteMessage = getInviteMessage();

  const handleWhatsApp = async (contact: UserContact) => {
    const url = getWhatsAppUrl(contact.phone_number, inviteMessage);
    window.open(url, "_blank");
    await markInvited.mutateAsync({ contactId: contact.id, channel: "whatsapp" });
    toast.success(`WhatsApp invite sent to ${contact.contact_name || contact.phone_number}`);
  };

  const handleNativeShare = async (contact: UserContact) => {
    if (!navigator.share) {
      toast.error("Share not supported on this device");
      return;
    }
    try {
      await navigator.share({
        title: "Join FindOO",
        text: inviteMessage,
        url: INVITE_BASE_URL,
      });
      await markInvited.mutateAsync({ contactId: contact.id, channel: "share_sheet" });
      toast.success("Invite shared!");
    } catch (err: any) {
      if (err.name !== "AbortError") {
        toast.error("Share failed");
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteMessage);
      toast.success("Invite link copied to clipboard!");
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  const handleBulkWhatsApp = async () => {
    const selected = contacts.filter((c) => selectedIds.has(c.id));
    for (const contact of selected) {
      await handleWhatsApp(contact);
      // Small delay between opens to avoid popup blocking
      await new Promise((r) => setTimeout(r, 500));
    }
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredContacts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredContacts.map((c) => c.id)));
    }
  };

  const invitedCount = contacts.filter((c) => c.invite_status === "invited").length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Invite Contacts
          </SheetTitle>
          <SheetDescription>
            Invite your imported contacts to join FindOO.
            {invitedCount > 0 && (
              <Badge variant="secondary" className="ml-2 text-[10px]">
                {invitedCount} already invited
              </Badge>
            )}
          </SheetDescription>
        </SheetHeader>

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-auto py-2 flex-col" onClick={handleCopyLink}>
            <Link2 className="h-4 w-4 text-primary" />
            Copy Link
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs h-auto py-2 flex-col"
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: "Join FindOO", text: inviteMessage, url: INVITE_BASE_URL });
              } else {
                handleCopyLink();
              }
            }}
          >
            <Share2 className="h-4 w-4 text-primary" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs h-auto py-2 flex-col text-green-600"
            onClick={() => {
              window.open(`https://wa.me/?text=${encodeURIComponent(inviteMessage)}`, "_blank");
            }}
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </Button>
        </div>

        {/* Contact list */}
        {uninvitedContacts.length > 0 && (
          <div className="flex-1 flex flex-col mt-4 min-h-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
              </div>
              {selectedIds.size > 0 && (
                <Button size="sm" className="gap-1 text-xs h-8 bg-green-600 hover:bg-green-700" onClick={handleBulkWhatsApp}>
                  <MessageCircle className="h-3 w-3" />
                  Send ({selectedIds.size})
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2 mb-2">
              <Checkbox
                checked={selectedIds.size === filteredContacts.length && filteredContacts.length > 0}
                onCheckedChange={toggleAll}
              />
              <span className="text-[10px] text-muted-foreground">
                Select all ({filteredContacts.length})
              </span>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-1">
                {filteredContacts.map((contact) => (
                  <div key={contact.id} className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-muted/50 group">
                    <Checkbox
                      checked={selectedIds.has(contact.id)}
                      onCheckedChange={() => toggleSelect(contact.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {contact.contact_name || "Unknown"}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {contact.phone_number}
                      </p>
                    </div>
                    {contact.matched_user_id ? (
                      <Badge variant="secondary" className="text-[10px] shrink-0">
                        <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                        On FindOO
                      </Badge>
                    ) : (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-green-600"
                          onClick={() => handleWhatsApp(contact)}
                          title="Invite via WhatsApp"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleNativeShare(contact)}
                          title="Share invite"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {uninvitedContacts.length === 0 && contacts.length > 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
            <CheckCircle2 className="h-10 w-10 text-green-500 mb-3" />
            <p className="text-sm font-medium">All contacts invited!</p>
            <p className="text-xs text-muted-foreground mt-1">
              You've invited all {contacts.length} imported contacts.
            </p>
          </div>
        )}

        {contacts.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
            <Users className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm font-medium">No contacts imported yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Import your contacts first, then invite them here.
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
