import CustomDialog from "./CustomDialog";

interface TutorialProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function Tutorial({ open, onOpenChange }: TutorialProps) {
  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      title="How Bulk Upload Works"
      description="Learn how to use the bulk upload feature"
      cancelText="Close"
      hideOptions
    >
      <div>
        <ol className="list-decimal list-inside space-y-3 text-foreground">
          <li>
            <strong>You upload your Excel sheet</strong> — any .xlsx file
            exported from Google Sheets or Excel works fine. The file is sent
            securely to our servers.
          </li>
          <li>
            <strong>
              You tell us which column contains your project names
            </strong>{" "}
            — sheets often have columns named differently (e.g., "Project",
            "project name", "Project Name", "Work Item", etc.). By entering
            the exact column header, you help us find the right data quickly
            and accurately.
          </li>
          <li>
            <strong>We read only the column you specified</strong> — the rest
            of the sheet (dates, time spent, task types, descriptions, etc.)
            is ignored during this step. This keeps the import focused and
            fast.
          </li>
          <li>
            <strong>We extract unique project names</strong> — if the same
            project appears in multiple rows, we count it only once to avoid
            duplicates.
          </li>
          <li>
            <strong>
              We add each unique project to your current company
            </strong>{" "}
            — every project is linked to the company you're viewing and tied
            to your account for proper organization and privacy.
          </li>
          <li>
            <strong>You get a confirmation</strong> — once complete, you'll
            see how many projects were added. Your project list updates
            immediately so you can start logging time right away.
          </li>
        </ol>

        <p className="text-sm text-muted-foreground mt-6">
          This feature is designed specifically for developers migrating from
          spreadsheets — it saves hours of manual entry while keeping your
          data clean and structured.
        </p>
      </div>
    </CustomDialog>
  );
}