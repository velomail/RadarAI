import { Button } from '@/components/ui/button';
import { SearchProfileFields, type SearchProfileDefaults } from './SearchProfileFields';

interface Props {
  defaults?: SearchProfileDefaults;
  submitLabel?: string;
  action: (formData: FormData) => Promise<void> | void;
}

export function SearchProfileForm({ defaults, submitLabel = 'Save profile', action }: Props) {
  return (
    <form action={action} className="flex flex-col gap-6">
      <SearchProfileFields defaults={defaults} />
      <Button type="submit" size="lg" className="self-start">
        {submitLabel}
      </Button>
    </form>
  );
}
