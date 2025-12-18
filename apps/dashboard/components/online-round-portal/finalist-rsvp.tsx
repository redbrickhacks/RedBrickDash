import { useState } from 'react';
import styled from 'styled-components';
import { Modal } from '@hibiscus/ui';
import { Button } from '@hibiscus/ui-kit-2023';
import { useHibiscusSupabase } from '@hibiscus/hibiscus-supabase-context';
import useHibiscusUser from '../../hooks/use-hibiscus-user/use-hibiscus-user';
import { toast } from 'react-hot-toast';

export function FinalistRSVP() {
  const [modalOpen, setModalOpen] = useState(false);
  const [choice, setChoice] = useState<'ACCEPT' | 'DECLINE' | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useHibiscusUser();
  const { supabase } = useHibiscusSupabase();

  const handleConfirm = async () => {
    setLoading(true);
    const newStatus = choice === 'ACCEPT' ? 4 : 5; // CONFIRMED or DECLINED

    const { error } = await supabase
      .getClient()
      .from('user_profiles')
      .update({ application_status: newStatus })
      .eq('user_id', user?.id);

    if (error) {
      toast.error('Failed to update status');
      setLoading(false);
      return;
    }

    if (choice === 'ACCEPT') {
      toast.success(
        'Congratulations! You are confirmed for the National Finals!'
      );
      updateUser({ applicationStatus: 'CONFIRMED' });
    } else {
      toast.success('Your response has been recorded.');
      updateUser({ applicationStatus: 'DECLINED' });
    }

    setModalOpen(false);
    setLoading(false);
  };

  return (
    <Container>
      <Celebration>Congratulations!</Celebration>
      <h1>You&apos;re a Finalist, {user?.firstName}!</h1>
      <p>
        Your team has been selected as a Finalist for the Red Brick Quacks
        National Finals!
      </p>

      <Details>
        <h3>Event Details</h3>
        <p>
          <strong>Date:</strong> TBD
        </p>
        <p>
          <strong>Location:</strong> TBD
        </p>
        <p>
          <strong>RSVP Deadline:</strong> TBD
        </p>
      </Details>

      <ButtonGroup>
        <Button
          color="red"
          onClick={() => {
            setChoice('DECLINE');
            setModalOpen(true);
          }}
        >
          Decline Spot
        </Button>
        <Button
          color="black"
          onClick={() => {
            setChoice('ACCEPT');
            setModalOpen(true);
          }}
        >
          Confirm My Spot
        </Button>
      </ButtonGroup>

      <Modal isOpen={modalOpen} closeModal={() => setModalOpen(false)}>
        <ConfirmModal>
          {choice === 'ACCEPT' ? (
            <>
              <h2>Confirm Your Spot</h2>
              <p>
                By confirming, you commit to attending the National Finals in
                person.
              </p>
              <p>Please ensure you can make it before confirming.</p>
            </>
          ) : (
            <>
              <h2>Decline Your Spot</h2>
              <p>Are you sure? This action cannot be undone.</p>
              <p>Your spot will be offered to a team on the waitlist.</p>
            </>
          )}

          <ModalButtons>
            <Button color="grey" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              color={choice === 'ACCEPT' ? 'black' : 'red'}
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading
                ? 'Processing...'
                : choice === 'ACCEPT'
                ? 'Confirm'
                : 'Decline'}
            </Button>
          </ModalButtons>
        </ConfirmModal>
      </Modal>
    </Container>
  );
}

const Container = styled.div`
  text-align: center;
  padding: 2rem;

  h1 {
    color: #ff6347;
  }
`;

const Celebration = styled.div`
  font-size: 1.5rem;
  color: #4caf50;
  margin-bottom: 0.5rem;
`;

const Details = styled.div`
  background: #f5f5f5;
  padding: 1.5rem;
  border-radius: 12px;
  margin: 2rem auto;
  text-align: left;
  max-width: 400px;

  h3 {
    margin-top: 0;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

const ConfirmModal = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 400px;
  text-align: center;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
`;

export default FinalistRSVP;
