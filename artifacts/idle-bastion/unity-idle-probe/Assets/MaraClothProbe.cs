using UnityEngine;

// Deliberately restricted proof: only the free cloth edges move.
// No generated poses, facial patches, body scaling or game integration.
[ExecuteAlways]
public class MaraClothProbe : MonoBehaviour
{
    public Transform leftCloth;
    public Transform rightCloth;
    [Range(0, 1)] public float strength = 1;
    public bool animate = true;
    public const float Duration = 4f;

    public void Pose(float seconds)
    {
        float phase = seconds / Duration * Mathf.PI * 2;
        // Closed periodic curves; exactly the rest pose at both ends.
        leftCloth.localRotation = Quaternion.Euler(0, 0, strength * 1.5f * Mathf.Sin(phase));
        rightCloth.localRotation = Quaternion.Euler(0, 0, strength * -1.8f * Mathf.Sin(phase));
    }

    void Update()
    {
        if (Application.isPlaying && animate) Pose(Time.time);
    }
}
