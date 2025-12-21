import { useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import { TeamServiceAPI } from '../../common/api';
import useHibiscusUser from '../../hooks/use-hibiscus-user/use-hibiscus-user';
import { useTeam } from '../../hooks/use-team/use-team';
import { NeoButton, NeoInput } from '../neo-ui';

interface Props {
  closeModal: () => void;
}

export const TeamCreateForm = (props: Props) => {
  const { updateTeam } = useTeam();
  const { user, updateUser } = useHibiscusUser();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [nameError, setNameError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setNameError('Please enter your team name!');
      return;
    }
    setNameError('');

    setIsSubmitting(true);
    props.closeModal();

    const { data, error } = await TeamServiceAPI.createTeam(
      name.trim(),
      description.trim(),
      user.id
    );

    if (error) {
      toast.error("Oops, couldn't create your team: " + error.message);
      setIsSubmitting(false);
      return;
    }

    toast.success('Successfully created team!');
    updateTeam({
      name: name.trim(),
      description: description.trim(),
      id: data.id,
      organizerId: user.id,
      members: [
        {
          user_id: user.id,
          first_name: user.firstName,
          last_name: user.lastName,
        },
      ],
      invites: [],
    });
    updateUser({ teamId: data.id });
    setIsSubmitting(false);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <NeoInput
        label="Team Name"
        placeholder="e.g. The Innovators"
        value={name}
        onChange={(e) => setName((e.target as HTMLInputElement).value)}
        error={nameError}
        required
      />

      <NeoInput
        label="Description (optional)"
        placeholder="e.g. Team full of hackers :0 your local hackathon destroyer :)"
        value={description}
        onChange={(e) =>
          setDescription((e.target as HTMLTextAreaElement).value)
        }
        multiline
        rows={3}
      />

      <ButtonGroup>
        <NeoButton type="submit" loading={isSubmitting}>
          Create Team
        </NeoButton>
      </ButtonGroup>
    </Form>
  );
};

export default TeamCreateForm;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
`;
