import { verbs } from "../data/verbs";
import { BottomNav } from "../components/BottomNav";
import { Input } from "../components/ui/input";
import { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export default function Verbs() {
  const [search, setSearch] = useState("");

  const filtered = verbs
    .filter(v => v.infinitive.includes(search.toLowerCase()) || v.past.includes(search.toLowerCase()))
    .sort((a, b) => a.infinitive.localeCompare(b.infinitive))
    .slice(0, 100); // Limit to 100 for performance in list

  return (
    <div className="min-h-[100dvh] bg-background pb-20 md:pb-0 flex flex-col">
      <div className="w-full max-w-2xl mx-auto p-4 flex-1 flex flex-col">
        <h1 className="text-3xl font-bold mb-4">Verb Dictionary</h1>
        <Input 
          placeholder="Search verbs..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 h-12 text-lg"
        />
        
        <div className="space-y-2 overflow-y-auto pb-4 flex-1">
          {filtered.map(verb => (
            <Card key={verb.infinitive} className="border-border">
              <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold">{verb.infinitive}</span>
                  {verb.isIrregular && <Badge variant="secondary" className="text-[10px]">IRREGULAR</Badge>}
                </div>
                <div className="text-sm text-muted-foreground flex gap-4">
                  <div><span className="opacity-50">Past:</span> {verb.past}</div>
                  <div><span className="opacity-50">PP:</span> {verb.pastParticiple}</div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">No verbs found matching "{search}"</div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
