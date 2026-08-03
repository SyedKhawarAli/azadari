import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { LocalEvent } from "@/lib/offline/db";

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#111",
  },
  title: {
    fontSize: 20,
    marginBottom: 6,
  },
  meta: {
    fontSize: 10,
    color: "#555",
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  index: {
    width: 24,
    color: "#777",
  },
  body: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 12,
    marginBottom: 2,
  },
  note: {
    fontSize: 10,
    color: "#555",
  },
  badge: {
    fontSize: 9,
    color: "#666",
    marginTop: 2,
  },
});

export function EventProgrammeDocument({ event }: { event: LocalEvent }) {
  return (
    <Document title={event.title} author="Azadari">
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.meta}>
          {[event.eventDate, `${event.items.length} items`].filter(Boolean).join(" · ")}
        </Text>
        {event.items.map((item, index) => (
          <View key={item.id} style={styles.row} wrap={false}>
            <Text style={styles.index}>{index + 1}.</Text>
            <View style={styles.body}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.badge}>{item.lyricId ? "Lyric" : "Segment"}</Text>
              {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
            </View>
          </View>
        ))}
      </Page>
    </Document>
  );
}
